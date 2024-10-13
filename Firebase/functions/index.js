const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const { getFirestore } = require("firebase-admin/firestore");
const { Client } = require("@googlemaps/google-maps-services-js");

require('dotenv').config();

setGlobalOptions({ maxInstances: 10 });

const admin = require("firebase-admin");
admin.initializeApp();

const db = getFirestore();
const mapsClient = new Client({});

const functions = require('firebase-functions');
const mapsApiKey = functions.config().googlemaps.key;

// Haversine formula to calculate distance between two points
function getDistanceFromLatLonInMiles(lat1, lon1, lat2, lon2) {
  const R = 3959; // Radius of the earth in miles
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in miles
  return d;
}

function deg2rad(deg) {
  return deg * (Math.PI / 180);
}

async function getCoordinates(address) {
  try {
    const response = await mapsClient.geocode({
      params: {
        address: address,
        key: process.env.GOOGLE_MAPS_API_KEY || functions.config().googlemaps.key
      }
    });
    if (response.data.results && response.data.results.length > 0) {
      const { lat, lng } = response.data.results[0].geometry.location;
      return { latitude: lat, longitude: lng };
    }
    throw new Error('No results found');
  } catch (error) {
    console.error('Error getting coordinates:', error);
    return null;
  }
}

function calculateScheduleCompatibility(schedule1, schedule2) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeSlots = [
    "7am to 9am", "9am to 11am", "11am to 1pm", "1pm to 3pm",
    "3pm to 5pm", "5pm to 7pm", "7pm to 9pm"
  ];
  
  let compatibleSlots = 0;
  let totalSlots = 0;

  for (const day of days) {
    for (const slot of timeSlots) {
      if (schedule1[day].includes(slot) && schedule2[day].includes(slot)) {
        compatibleSlots++;
      }
      if (schedule1[day].includes(slot) || schedule2[day].includes(slot)) {
        totalSlots++;
      }
    }
  }

  return compatibleSlots / totalSlots;
}

exports.pairUsers = onDocumentCreated("unpaired/{docId}", async (event) => {
  const newUser = event.data.data();
  const newUserId = event.data.id;

  if (!newUser || !newUser.role || !newUser.gender || !newUser.mentorType || 
      !newUser.ethnicity || !newUser.sexualOrientation || !newUser.age ||
      !newUser.street || !newUser.city || !newUser.state || !newUser.zipcode ||
      !newUser.genderPreference || !newUser.ethnicityPreference || !newUser.sexualOrientationPreference ||
      !newUser.schedule || !newUser.cadence) {
    console.log("Invalid document data");
    return null;
  }

  // Get coordinates for the new user
  const newUserAddress = `${newUser.street}, ${newUser.city}, ${newUser.state} ${newUser.zipcode}`;
  const newUserCoords = await getCoordinates(newUserAddress);
  if (!newUserCoords) {
    console.log("Could not get coordinates for new user");
    return null;
  }

  const oppositeRole = newUser.role === "mentor" ? "mentee" : "mentor";

  let query = db.collection("unpaired").where("role", "==", oppositeRole);

  // Apply filters based on preferences
  if (newUser.genderPreference !== "doesn't matter") {
    query = query.where("gender", "==", newUser.gender);
  }
  if (newUser.ethnicityPreference !== "doesn't matter") {
    query = query.where("ethnicity", "==", newUser.ethnicity);
  }
  if (newUser.sexualOrientationPreference !== "doesn't matter") {
    query = query.where("sexualOrientation", "==", newUser.sexualOrientation);
  }

  query = query.where("mentorType", "==", newUser.mentorType)
               .where("cadence", "==", newUser.cadence);

  const querySnapshot = await query.get();

  if (querySnapshot.empty) {
    console.log("No potential matches found");
    return null;
  }

  let matchedUser = null;
  let matchedUserId = null;

  for (const doc of querySnapshot.docs) {
    const potentialMatch = doc.data();

    // Check if preferences match
    if ((newUser.genderPreference === "doesn't matter" || potentialMatch.genderPreference === "doesn't matter" || newUser.gender === potentialMatch.gender) &&
        (newUser.ethnicityPreference === "doesn't matter" || potentialMatch.ethnicityPreference === "doesn't matter" || newUser.ethnicity === potentialMatch.ethnicity) &&
        (newUser.sexualOrientationPreference === "doesn't matter" || potentialMatch.sexualOrientationPreference === "doesn't matter" || newUser.sexualOrientation === potentialMatch.sexualOrientation)) {

      // Check age criteria
      const ageDifference = Math.abs(newUser.age - potentialMatch.age);
      const minAgeDifference = newUser.mentorType === "homework_help" ? 2 : 10;
      
      if ((newUser.role === "mentor" && newUser.age - potentialMatch.age >= minAgeDifference) ||
          (newUser.role === "mentee" && potentialMatch.age - newUser.age >= minAgeDifference)) {
        
        // Check schedule compatibility
        const scheduleCompatibility = calculateScheduleCompatibility(newUser.schedule, potentialMatch.schedule);
        
        if (scheduleCompatibility >= 0.8) {
          // Check distance criteria
          const matchAddress = `${potentialMatch.street}, ${potentialMatch.city}, ${potentialMatch.state} ${potentialMatch.zipcode}`;
          const matchCoords = await getCoordinates(matchAddress);
          if (matchCoords) {
            const distance = getDistanceFromLatLonInMiles(
              newUserCoords.latitude, newUserCoords.longitude,
              matchCoords.latitude, matchCoords.longitude
            );
            
            if (distance <= 60) {
              matchedUser = potentialMatch;
              matchedUserId = doc.id;
              break;
            }
          }
        }
      }
    }
  }

  if (!matchedUser) {
    console.log("No matching user found meeting all criteria");
    return null;
  }

  const batch = db.batch();

  // Copy users to paired collection
  batch.set(db.collection("paired").doc(newUserId), newUser);
  batch.set(db.collection("paired").doc(matchedUserId), matchedUser);

  // Create pair document
  const pairData = {
    mentorId: newUser.role === "mentor" ? newUserId : matchedUserId,
    menteeId: newUser.role === "mentee" ? newUserId : matchedUserId,
  };
  batch.set(db.collection("pairs").doc(), pairData);

  // Delete users from unpaired collection
  batch.delete(db.collection("unpaired").doc(newUserId));
  batch.delete(db.collection("unpaired").doc(matchedUserId));

  await batch.commit();

  console.log(`Paired users: ${newUserId} and ${matchedUserId}`);
  return null;
});
/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

const {onRequest} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

exports.helloWorld = onRequest((request, response) => {
  logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

// the real stuff.

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

initializeApp();

exports.simplifyUserData = onDocumentCreated("/unpaired/{docId}", async (event) => {
  const db = getFirestore();
  
  // Since this is onDocumentCreated, we know the document exists
  const newData = event.data.data();
  const simplifiedData = {};

  simplifiedData.academic_level = newData.academic_level.toLowerCase().replace(/ /g, '-');
  simplifiedData.age_group = newData.age_group;
  simplifiedData.background_in_steam = newData.background_in_steam.toLowerCase();
  simplifiedData.cadence = newData.cadence;
  simplifiedData.city = newData.city;
  simplifiedData.email = newData.email;
  simplifiedData.ethnicity = newData.ethnicity;

    if (newData.ethnicity_preference) {
      if (newData.ethnicity_preference.includes('ONLY')) simplifiedData.ethnicity_preference = 'only-similar';
      else if (newData.ethnicity_preference.includes('availible')) simplifiedData.ethnicity_preference = 'prefer-similar';
      else if (newData.ethnicity_preference.includes('NOT')) simplifiedData.ethnicity_preference = 'not-similar';
      else if (newData.ethnicity_preference.includes('Do not have a preference')) simplifiedData.ethnicity_preference = 'no-preference';
      else simplifiedData.ethnicity_preference = newData.ethnicity_preference;
    }

  simplifiedData.gender = newData.gender.toLowerCase().replace(/ /g, '-');
  
    if (newData.gender_preference) {
      if (newData.gender_preference.includes('ONLY')) simplifiedData.gender_preference = 'only-similar';
      else if (newData.gender_preference.includes('availible')) simplifiedData.gender_preference = 'prefer-similar';
      else if (newData.gender_preference.includes('NOT')) simplifiedData.gender_preference = 'not-similar';
      else if (newData.gender_preference.includes('Do not have a preference')) simplifiedData.gender_preference = 'no-preference';
      else simplifiedData.gender_preference = newData.gender_preference;
    }

  simplifiedData.grade = parseInt(newData.grade, 10);
  
  if (newData.meeting_format_preference) {
          if (newData.meeting_format_preference.toLowerCase().includes('hybrid')) simplifiedData.meeting_format_preference = 'hybrid';
          else if (newData.meeting_format_preference.toLowerCase().includes('in person')) simplifiedData.meeting_format_preference = 'in-person';
          else if (newData.meeting_format_preference.toLowerCase().includes('web')) simplifiedData.meeting_format_preference = 'online';
          else simplifiedData.meeting_format_preference = newData.meeting_format_preference.toLowerCase();
    }
  
  simplifiedData.name = newData.name;
  simplifiedData.phone_number = formatPhoneNumber(newData.phone_number);
  simplifiedData.role = newData.role.toLowerCase().includes('mentee') ? 'mentee' : 'mentor';
  simplifiedData.schedule_monday = newData.schedule_monday;
  simplifiedData.schedule_thursday = newData.schedule_thursday;
  simplifiedData.session_type = newData.session_type.split(', ').map(type => type.toLowerCase().replace(' ', '-'));
  simplifiedData.state = newData.state.split(' : ')[0];
  simplifiedData.timestamp = newData.timestamp;

  try {
    await event.data.ref.set(simplifiedData, { merge: true });
    console.log("Document successfully updated");
  } catch (error) {
    console.error("Error updating document: ", error);
  }
});

function formatPhoneNumber(phoneNumberString) {
  const cleaned = ('' + phoneNumberString).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return '(' + match[1] + ') ' + match[2] + '-' + match[3];
  }
  return phoneNumberString;
}

/// MATCHING

const db = getFirestore();

function calculateScheduleCompatibility(schedule1, schedule2) {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  let compatibleSlots = 0;
  let totalSlots = 0;

  for (const day of days) {
    const dayKey = `schedule_${day}`;
    if (schedule1[dayKey] && schedule2[dayKey]) {
      compatibleSlots++;
    }
    if (schedule1[dayKey] || schedule2[dayKey]) {
      totalSlots++;
    }
  }

  const compatibility = totalSlots > 0 ? compatibleSlots / totalSlots : 0;
  return compatibility;
}

exports.pairMentorMentee = onDocumentCreated("unpaired/{docId}", async (event) => {
// Since this is onDocumentCreated, we know the document exists
const newData = event.data.data();
const simplifiedData = {};

simplifiedData.academic_level = newData.academic_level.toLowerCase().replace(/ /g, '-');
simplifiedData.age_group = newData.age_group;
simplifiedData.background_in_steam = newData.background_in_steam.toLowerCase();
simplifiedData.cadence = newData.cadence;
simplifiedData.city = newData.city;
simplifiedData.email = newData.email;
simplifiedData.ethnicity = newData.ethnicity;

  if (newData.ethnicity_preference) {
    if (newData.ethnicity_preference.includes('ONLY')) simplifiedData.ethnicity_preference = 'only-similar';
    else if (newData.ethnicity_preference.includes('availible')) simplifiedData.ethnicity_preference = 'prefer-similar';
    else if (newData.ethnicity_preference.includes('NOT')) simplifiedData.ethnicity_preference = 'not-similar';
    else if (newData.ethnicity_preference.includes('Do not have a preference')) simplifiedData.ethnicity_preference = 'no-preference';
    else simplifiedData.ethnicity_preference = newData.ethnicity_preference;
  }

simplifiedData.gender = newData.gender.toLowerCase().replace(/ /g, '-');

  if (newData.gender_preference) {
    if (newData.gender_preference.includes('ONLY')) simplifiedData.gender_preference = 'only-similar';
    else if (newData.gender_preference.includes('availible')) simplifiedData.gender_preference = 'prefer-similar';
    else if (newData.gender_preference.includes('NOT')) simplifiedData.gender_preference = 'not-similar';
    else if (newData.gender_preference.includes('Do not have a preference')) simplifiedData.gender_preference = 'no-preference';
    else simplifiedData.gender_preference = newData.gender_preference;
  }

simplifiedData.grade = parseInt(newData.grade, 10);

if (newData.meeting_format_preference) {
        if (newData.meeting_format_preference.toLowerCase().includes('hybrid')) simplifiedData.meeting_format_preference = 'hybrid';
        else if (newData.meeting_format_preference.toLowerCase().includes('in person')) simplifiedData.meeting_format_preference = 'in-person';
        else if (newData.meeting_format_preference.toLowerCase().includes('web')) simplifiedData.meeting_format_preference = 'online';
        else simplifiedData.meeting_format_preference = newData.meeting_format_preference.toLowerCase();
  }

simplifiedData.name = newData.name;
simplifiedData.phone_number = formatPhoneNumber(newData.phone_number);
simplifiedData.role = newData.role.toLowerCase().includes('mentee') ? 'mentee' : 'mentor';
simplifiedData.schedule_monday = newData.schedule_monday;
simplifiedData.schedule_thursday = newData.schedule_thursday;
simplifiedData.session_type = newData.session_type.split(', ').map(type => type.toLowerCase().replace(' ', '-'));
simplifiedData.state = newData.state.split(' : ')[0];
simplifiedData.timestamp = newData.timestamp;

try {
  await event.data.ref.set(simplifiedData, { merge: true });
  console.log("Document successfully updated");
} catch (error) {
  console.error("Error updating document: ", error);
}

// SECONDARY
  const newUser = event.data.data();
  const newUserId = event.data.id;

  logger.info(`New user added to unpaired collection`, { userId: newUserId, role: newUser.role, data: newUser });

  if (!newUser || !newUser.role || !newUser.gender || !newUser.ethnicity || 
      !newUser.age_group || !newUser.city || !newUser.state || !newUser.cadence) {
    logger.warn("Invalid document data", { userId: newUserId, data: newUser });
    return null;
  }

  const oppositeRole = newUser.role === "mentor" ? "mentee" : "mentor";

  // Only filter by opposite role in the initial query
  let query = db.collection("unpaired").where("role", "==", oppositeRole);

  logger.info(`Building initial query for opposite role`, { oppositeRole });

  const querySnapshot = await query.get();
  logger.info(`Initial query returned ${querySnapshot.size} potential matches`);

  let matchedUser = null;
  let matchedUserId = null;

  for (const doc of querySnapshot.docs) {
    const potentialMatch = doc.data();
    logger.info(`Evaluating potential match`, { matchId: doc.id, matchRole: potentialMatch.role, matchData: potentialMatch });

    const criteriaResults = {
      role: true, // Already filtered in query
      cadence: newUser.cadence == potentialMatch.cadence,
      gender: newUser.gender_preference != "only-similar" || newUser.gender == potentialMatch.gender,
      ethnicity: newUser.ethnicity_preference != "only-similar" || newUser.ethnicity == potentialMatch.ethnicity,
      scheduleCompatibility: calculateScheduleCompatibility(newUser, potentialMatch) >= 0.5
    };

    logger.info(`Matching criteria results`, { 
      matchId: doc.id, 
      criteriaResults: criteriaResults,
      userCadence: newUser.cadence,
      matchCadence: potentialMatch.cadence,
      userGender: newUser.gender,
      matchGender: potentialMatch.gender,
      userGenderPreference: newUser.gender_preference,
      userEthnicity: newUser.ethnicity,
      matchEthnicity: potentialMatch.ethnicity,
      userEthnicityPreference: newUser.ethnicity_preference,
      scheduleCompatibility: criteriaResults.scheduleCompatibility
    });

    if (Object.values(criteriaResults).every(result => result === true)) {
      matchedUser = potentialMatch;
      matchedUserId = doc.id;
      logger.info(`All criteria passed. Match found`, { matchedUserId });
      break;
    } else {
      logger.info(`Match criteria not met`, { matchId: doc.id, failedCriteria: Object.keys(criteriaResults).filter(key => !criteriaResults[key]) });
    }
  }

  if (!matchedUser) {
    logger.warn("No matching user found meeting all criteria", { userId: newUserId });
    return null;
  }

  logger.info(`Proceeding to pair users`, { newUserId, matchedUserId });

  const batch = db.batch();

  // Move users to paired collection
  batch.set(db.collection("paired").doc(newUserId), newUser);
  batch.set(db.collection("paired").doc(matchedUserId), matchedUser);

  // Create pair document
  const pairData = {
    mentorId: newUser.role === "mentor" ? newUserId : matchedUserId,
    menteeId: newUser.role === "mentee" ? newUserId : matchedUserId,
  };
  
  batch.set(db.collection("pairs").doc(), pairData);

  // Remove from unpaired collection
  batch.delete(db.collection("unpaired").doc(newUserId));
  batch.delete(db.collection("unpaired").doc(matchedUserId));

  try {
    await batch.commit();
    logger.info(`Successfully paired users`, { newUserId, matchedUserId });
  } catch (error) {
    logger.error(`Error committing batch`, { error: error.message, newUserId, matchedUserId });
    return null;
  }

  return null;
});
import fetch from 'node-fetch';
import { firestore } from './firebase.mjs';
import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    deleteDoc,
    getDoc
  } from 'firebase/firestore'
import { Console } from 'console';

async function getCoordinates(address) {
    const apiKey = 'API KEY'; // Replace with your API key
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`);
    const data = await response.json();
    
    if (data.results.length > 0) {
        return { latitude: data.results[0].geometry.location.lat, longitude: data.results[0].geometry.location.lng };
    }
    console.log('Unable to get coordinates');
}

async function matchMentorsAndMentees() {
    const mentorRef =  await getDocs(collection(firestore, 'mentor'))
    const menteeRef =  await getDocs(collection(firestore, 'mentee'));
    const mentors = mentorRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const mentees = menteeRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    mentees.forEach(async mentee => {
        if (!mentee.isMatched) {
            // const menteeLocation = await getCoordinates(mentee.address); // COMMENTED OUT FOR TESTING

            mentors.forEach(async mentor => {
                if (!mentor.isMatched && mentor.gender === mentee.preferGender) {
                    console.log(`Matched ${mentor.firstName} with ${mentee.firstName}`);
                    const mentorLocation = await getCoordinates(mentor.address); // Geocode mentor address

                    const distance = haversineDistance(menteeLocation, mentorLocation);
                    
                    if (distance <= 50) { // Check if within 50 miles
                        // Match the mentor and mentee
                        await firestore.collection('mentors').doc(mentor.id).update({ isMatched: true });
                        await firestore.collection('mentees').doc(mentee.id).update({ isMatched: true });

                        console.log(`Matched ${mentor.firstName} with ${mentee.firstName}`);
                    }
                }

            });
        }
    });
}

// Haversine formula to calculate distance
function haversineDistance(coord1, coord2) {
    const R = 3958.8; // Radius of the Earth in miles
    const dLat = (coord2.latitude - coord1.latitude) * (Math.PI / 180);
    const dLon = (coord2.longitude - coord1.longitude) * (Math.PI / 180);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(coord1.latitude * (Math.PI / 180)) * Math.cos(coord2.latitude * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in miles
}

// Call the matching function
matchMentorsAndMentees();

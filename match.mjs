import { firestore } from './firebase.mjs';
import axios from 'axios';

import {
    collection,
    doc,
    getDocs,
    query,
    setDoc,
    deleteDoc,
    getDoc,
    where
  } from 'firebase/firestore'


async function matchMentorsAndMentees() {
    const mentorRef =  await getDocs(collection(firestore, 'mentor'));
    const menteeRef =   await getDocs(query(collection(firestore, 'mentee'), where("isMatched", "==", false)));
    const mentors = mentorRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    const mentees = menteeRef.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    mentees.forEach(async mentee => {
        mentors.forEach(async mentor => {
            if (mentor.gender === mentee.preferGender && mentor.ethnicity === mentee.preferRace) {

                const ageDifference = Math.abs(mentor.age - mentee.age); 
                const distance = await convertGPS(mentor.address, mentee.address);
                console.log(`distance: ${distance}`);
                if (ageDifference >= 10 && distance <= 60){
                    console.log(`Matched ${mentor.firstName} with ${mentee.firstName}`);
                    console.log(`distance: ${distance}`);   
                }
            }

        });
        
    });
}

async function convertGPS(mentorAddress, menteeAddress) {
    const query1 = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(mentorAddress)}&key=${process.env.MAPS_KEY}`);
    const data1 = query1.data;
    const coordinate1 = data1.results[0].geometry.location;

    const query2 = await axios.get(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(menteeAddress)}&key=${process.env.MAPS_KEY}`);
    const data2 = query2.data;
    const coordinate2 = data2.results[0].geometry.location;

    return haversineDistance(coordinate1, coordinate2);

}
function haversineDistance(loc1, loc2){
    const R = 3958.8; // Radius of the Earth in miles
    const lat1 = loc1.lat;
    const lon1 = loc1.lng;
    const lat2 = loc2.lat;
    const lon2 = loc2.lng;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c ; // Distance in miles
}
matchMentorsAndMentees();

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

// Function to calculate distance (in miles) between two locations
const calculateDistance = (loc1, loc2) => {
    const R = 3958.8; // Radius of the Earth in miles
    const lat1 = loc1.lat;
    const lon1 = loc1.lon;
    const lat2 = loc2.lat;
    const lon2 = loc2.lon;

    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in miles
};

// Function to find common available slots
const findCommonAvailability = (mentorAvailability, menteeAvailability) => {
    const commonSlots = [];
    
    // Iterate through each day in mentee's availability
    for (const day in menteeAvailability) {
        if (mentorAvailability[day]) { // Check if mentor has availability for that day
            menteeAvailability[day].forEach(menteeSlot => {
                mentorAvailability[day].forEach(mentorSlot => {
                    if (menteeSlot === mentorSlot) {
                        commonSlots.push({
                            day: day,
                            slot: menteeSlot, // Same slot for both
                        });
                    }
                });
            });
        }
    }

    return commonSlots.slice(0, 6); // Limit to 6 potential meeting times
};

// Function to generate future appointment dates
const generateFutureAppointments = (commonSlots) => {
    const futureAppointments = [];
    const today = new Date();
    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    commonSlots.forEach(slot => {
        let dayIndex = daysOfWeek.indexOf(slot.day);
        let nextAvailableDate = new Date(today);
        
        // Find the next occurrence of the available day
        while (nextAvailableDate.getDay() !== dayIndex) {
            nextAvailableDate.setDate(nextAvailableDate.getDate() + 1);
        }

        // Combine date and time slot
        const appointmentDateTime = new Date(`${nextAvailableDate.toISOString().split('T')[0]}T${slot.slot}:00`);
        
        if (appointmentDateTime > today) {
            futureAppointments.push(appointmentDateTime);
        }
    });

    // Limit to the next 6 appointments
    return futureAppointments.slice(0, 6);
};

// Cloud Function to find matches based on criteria
exports.findMatches = functions.https.onRequest(async (req, res) => {
    const menteeId = req.query.menteeId;

    try {
        // Fetch mentee data
        const menteeSnapshot = await admin.firestore().collection('mentees').doc(menteeId).get();
        const mentee = menteeSnapshot.data();

        if (!mentee) {
            return res.status(404).send('Mentee not found');
        }

        // Fetch all mentors
        const mentorsSnapshot = await admin.firestore().collection('mentors').get();
        const matches = [];

        mentorsSnapshot.forEach(mentorDoc => {
            const mentor = mentorDoc.data();

            // Check location distance
            const distance = calculateDistance(mentee.location, mentor.location);
            if (distance > 60) return; // Skip if not within 60 miles

            // Check age difference
            const ageDifference = Math.abs(mentee.age - mentor.age);
            const isHomeworkHelp = mentor.mentorType === "Homework Help";
            if ((isHomeworkHelp && ageDifference > 2) || (!isHomeworkHelp && ageDifference < 10)) {
                return; // Skip if age difference is not suitable
            }

            // Check ethnicity, gender, and sexuality matches
            const matchEthnicity = mentee.preferences.matchEthnicity ? mentee.ethnicity === mentor.ethnicity : true;
            const matchGender = mentee.preferences.matchGender ? mentee.gender === mentor.gender : true;
            const matchSexuality = mentee.preferences.matchSexuality ? mentee.sexuality === mentor.sexuality : true;

            // Only add to matches if all conditions are met
            if (matchEthnicity && matchGender && matchSexuality) {
                const commonSlots = findCommonAvailability(mentor.availability, mentee.availability);
                if (commonSlots.length > 0) {
                    const futureAppointments = generateFutureAppointments(commonSlots);
                    matches.push({
                        mentorId: mentorDoc.id,
                        mentorName: mentor.name,
                        distance,
                        availableSlots: commonSlots,
                        futureAppointments // Add future appointments
                    });
                }
            }
        });

        // Sort matches by distance (optional)
        matches.sort((a, b) => a.distance - b.distance);

        return res.status(200).json(matches);
    } catch (error) {
        console.error('Error fetching data:', error);
        return res.status(500).send('Internal Server Error');
    }
});

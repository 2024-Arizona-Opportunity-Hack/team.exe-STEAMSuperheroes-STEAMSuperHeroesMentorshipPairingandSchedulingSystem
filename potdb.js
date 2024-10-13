const admin = require('firebase-admin');
admin.initializeApp();

const menteesData = {
    mentee1: {
        name: "Alice",
        location: { lat: 40.7128, lon: -74.0060 },
        age: 25,
        ethnicity: "Hispanic",
        gender: "Female",
        sexuality: "Straight",
        preferences: {
            matchEthnicity: true,
            matchGender: true,
            matchSexuality: true
        },
        availability: [
            { day: "Monday", slots: ["10:00 AM", "2:00 PM"] },
            { day: "Wednesday", slots: ["1:00 PM", "3:00 PM"] }
        ]
    },
    mentee2: {
        name: "Bob",
        location: { lat: 34.0522, lon: -118.2437 },
        age: 22,
        ethnicity: "Caucasian",
        gender: "Male",
        sexuality: "Straight",
        preferences: {
            matchEthnicity: false,
            matchGender: true,
            matchSexuality: false
        },
        availability: [
            { day: "Tuesday", slots: ["11:00 AM", "4:00 PM"] },
            { day: "Thursday", slots: ["2:00 PM", "5:00 PM"] }
        ]
    }
};

const mentorsData = {
    mentor1: {
        name: "Charlie",
        location: { lat: 40.73061, lon: -73.935242 },
        age: 30,
        ethnicity: "Hispanic",
        gender: "Female",
        sexuality: "Straight",
        mentorType: "Homework Help",
        availability: [
            { day: "Monday", slots: ["10:00 AM", "2:00 PM"] },
            { day: "Tuesday", slots: ["1:00 PM", "3:00 PM"] }
        ]
    },
    mentor2: {
        name: "Dana",
        location: { lat: 37.7749, lon: -122.4194 },
        age: 35,
        ethnicity: "Asian",
        gender: "Female",
        sexuality: "Bisexual",
        mentorType: "Career Guidance",
        availability: [
            { day: "Wednesday", slots: ["1:00 PM", "3:00 PM"] },
            { day: "Thursday", slots: ["2:00 PM", "5:00 PM"] }
        ]
    }
};

async function initializeDatabase() {
    try {
        await admin.database().ref('mentees').set(menteesData);
        await admin.database().ref('mentors').set(mentorsData);
        console.log('Database initialized successfully!');
    } catch (error) {
        console.error('Error initializing database:', error);
    }
}

initializeDatabase();

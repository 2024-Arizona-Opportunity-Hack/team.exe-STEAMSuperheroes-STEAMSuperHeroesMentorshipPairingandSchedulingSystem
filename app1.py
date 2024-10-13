# -*- coding: utf-8 -*-
"""app.ipynb

Automatically generated by Colab.

Original file is located at
    https://colab.research.google.com/drive/1EJ18bNJ0l0-TWl48FOGmyrGw54g6I4so
"""

# Install streamlit before running: pip install streamlit
import streamlit as st

# Setting up the sidebar
st.sidebar.title("Mentorship Program Dashboard")
st.sidebar.write("Use this dashboard to monitor mentor-mentee matches, manage scheduling, and analyze metrics.")

# Layout: 3 columns
col1, col2, col3 = st.columns(3)

# Column 1: Mentor-Mentee Matches
with col1:
    st.header("Mentor-Mentee Matches")
    # Placeholder for displaying match info (this can be replaced with dynamic data)
    st.subheader("Current Matches")
    st.table({
        "Mentor": ["Alice", "Bob", "Charlie"],
        "Mentee": ["John", "Emma", "Sophia"],
        "Match Date": ["2024-10-01", "2024-09-28", "2024-09-20"]
    })

    st.subheader("Pending Matches")
    st.write("No pending matches at the moment.")

# Column 2: Scheduling Options and Automation
with col2:
    st.header("Scheduling and Automation")

    # Scheduling options
    st.date_input("Select Meeting Date")
    st.time_input("Select Meeting Time")
    st.text_input("Enter Location (Zoom or Physical Address)")

    # Automation options
    send_email = st.checkbox("Send Email Notification")
    send_text = st.checkbox("Send Text Notification")

    if st.button("Send Schedule to Mentor and Mentee"):
        # Logic for sending schedules (API calls to email or SMS services)
        st.success("Schedule sent successfully!")

# Column 3: Metrics of Meetings
with col3:
    st.header("Meeting Metrics")

    # Metrics display (dummy data; replace with real data processing logic)
    st.metric("Total Meetings", "15")
    st.metric("Average Meeting Duration", "45 min")
    st.metric("In-person Meetings", "5")
    st.metric("Zoom Meetings", "10")

    # Display additional meeting details
    st.subheader("Meeting History")
    st.table({
        "Mentor": ["Alice", "Bob", "Charlie"],
        "Mentee": ["John", "Emma", "Sophia"],
        "Duration (min)": [60, 30, 45],
        "Location": ["Zoom", "Office", "Zoom"]
    })

# Running Streamlit App
# Save the file as 'app.py' and run `streamlit run app.py` in your terminal.
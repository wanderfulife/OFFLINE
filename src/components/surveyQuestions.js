// 🎯 COMPREHENSIVE SURVEY TEMPLATE
// This demonstrates EVERY feature implemented in the survey system!

export const templateSurveyQuestions = [
    // 🏢 Work Station Question (for poste-travail functionality)
    {
        id: "WORK_STATION",
        text: "At which location are you conducting this survey?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Downtown Office", next: "AGE" },
            { id: 2, text: "Shopping Mall", next: "AGE" },
            { id: 3, text: "Train Station", next: "AGE" },
            { id: 4, text: "University Campus", next: "AGE" },
            { id: 5, text: "Other Location", next: "LOCATION_SPECIFY" }
        ]
    },

    // 📝 Free text precision for work station
    {
        id: "LOCATION_SPECIFY",
        text: "Please specify the location:",
        type: 'freeText',
        freeTextPlaceholder: "Enter location details...",
        next: "AGE"
    },

    // 👤 Age with conditional termination
    {
        id: "AGE",
        text: "What is your age group?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Under 16", next: "end" }, // Survey termination
            { id: 2, text: "16-17", next: "GUARDIAN_CONSENT" },
            { id: 3, text: "18-24", next: "EDUCATION" },
            { id: 4, text: "25-34", next: "EMPLOYMENT" },
            { id: 5, text: "35-49", next: "EMPLOYMENT" },
            { id: 6, text: "50-64", next: "EMPLOYMENT" },
            { id: 7, text: "65+", next: "RETIREMENT" }
        ]
    },

    // 👨‍👩‍👧‍👦 Minor consent (conditional question)
    {
        id: "GUARDIAN_CONSENT",
        text: "Do you have guardian consent to participate in this survey?",
        type: 'singleChoice',
        condition: "AGE == 2", // Only for 16-17 year olds
        options: [
            { id: 1, text: "Yes", next: "EDUCATION" },
            { id: 2, text: "No", next: "end" }
        ],
        fallbackNext: "EDUCATION"
    },

    // 🎓 Education (conditional routing based on age)
    {
        id: "EDUCATION",
        text: "What is your current education level?",
        type: 'singleChoice',
        condition: "AGE >= 2 AND AGE <= 3", // Only for younger participants
        options: [
            { id: 1, text: "High school student", next: "INTERESTS" },
            { id: 2, text: "High school graduate", next: "INTERESTS" },
            { id: 3, text: "University student", next: "UNIVERSITY_DETAILS" },
            { id: 4, text: "University graduate", next: "EMPLOYMENT" }
        ],
        fallbackNext: "EMPLOYMENT"
    },

    // 🏫 University details with conditional text
    {
        id: "UNIVERSITY_DETAILS",
        text: "Default university question",
        type: 'multipleChoice',
        conditionalText: {
            condition: "WORK_STATION",
            routes: [
                { value: 4, text: "Since you're at a university campus, what describes your university experience?" },
                { value: 1, text: "What describes your university experience?" },
                { value: 2, text: "What describes your university experience?" },
                { value: 3, text: "What describes your university experience?" }
            ]
        },
        options: [
            { id: 1, text: "Full-time student" },
            { id: 2, text: "Part-time student" },
            { id: 3, text: "Graduate student" },
            { id: 4, text: "Research assistant" },
            { id: 5, text: "Other", next_if_selected: "UNIVERSITY_OTHER" }
        ],
        next: "INTERESTS"
    },

    // 📝 University other specification
    {
        id: "UNIVERSITY_OTHER",
        text: "Please specify your university role:",
        type: 'freeText',
        freeTextPlaceholder: "Describe your role...",
        next: "INTERESTS"
    },

    // 💼 Employment status
    {
        id: "EMPLOYMENT",
        text: "What is your employment status?",
        type: 'singleChoice',
        condition: "AGE >= 4 AND AGE <= 6", // Only for working age adults
        options: [
            { id: 1, text: "Full-time employed", next: "JOB_SECTOR" },
            { id: 2, text: "Part-time employed", next: "JOB_SECTOR" },
            { id: 3, text: "Self-employed", next: "BUSINESS_TYPE" },
            { id: 4, text: "Unemployed", next: "INTERESTS" },
            { id: 5, text: "Student", next: "EDUCATION" }
        ],
        fallbackNext: "INTERESTS"
    },

    // 🏭 Job sector with complex routing
    {
        id: "JOB_SECTOR",
        text: "In which sector do you work?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Technology", next: "TECH_ROLE" },
            { id: 2, text: "Healthcare", next: "TRANSPORT_WORK" },
            { id: 3, text: "Education", next: "TRANSPORT_WORK" },
            { id: 4, text: "Finance", next: "TRANSPORT_WORK" },
            { id: 5, text: "Other", next: "JOB_OTHER" }
        ],
        conditionalNext: [
            {
                condition: "EMPLOYMENT",
                routes: [
                    { value: 2, next: "PART_TIME_HOURS" }, // Part-time goes to hours question
                    { value: 1, next: null } // Full-time continues normal flow
                ]
            }
        ]
    },

    // 💻 Tech role specification
    {
        id: "TECH_ROLE",
        text: "What is your role in technology?",
        type: 'multipleChoice',
        options: [
            { id: 1, text: "Software Developer" },
            { id: 2, text: "Data Scientist" },
            { id: 3, text: "Product Manager" },
            { id: 4, text: "Designer" },
            { id: 5, text: "DevOps/Infrastructure" },
            { id: 6, text: "Other tech role", next_if_selected: "TECH_OTHER" }
        ],
        next: "REMOTE_WORK"
    },

    // 📝 Tech other specification
    {
        id: "TECH_OTHER",
        text: "Please specify your tech role:",
        type: 'freeText',
        freeTextPlaceholder: "e.g., Cybersecurity Analyst, QA Engineer...",
        next: "REMOTE_WORK"
    },

    // 🏠 Remote work patterns
    {
        id: "REMOTE_WORK",
        text: "What is your remote work arrangement?",
        type: 'singleChoice',
        condition: "JOB_SECTOR == 1", // Only for tech workers
        options: [
            { id: 1, text: "Fully remote", next: "INTERESTS" },
            { id: 2, text: "Hybrid (2-3 days office)", next: "TRANSPORT_WORK" },
            { id: 3, text: "Mostly office (4-5 days)", next: "TRANSPORT_WORK" },
            { id: 4, text: "Fully office-based", next: "TRANSPORT_WORK" }
        ],
        fallbackNext: "TRANSPORT_WORK"
    },

    // ⏰ Part-time hours
    {
        id: "PART_TIME_HOURS",
        text: "How many hours per week do you work?",
        type: 'freeText',
        validation: "numeric",
        freeTextPlaceholder: "Enter number of hours",
        next: "TRANSPORT_WORK"
    },

    // 📝 Job other specification
    {
        id: "JOB_OTHER",
        text: "Please specify your job sector:",
        type: 'freeText',
        freeTextPlaceholder: "e.g., Manufacturing, Retail, Government...",
        next: "TRANSPORT_WORK"
    },

    // 🏢 Business type for self-employed
    {
        id: "BUSINESS_TYPE",
        text: "What type of business do you run?",
        type: 'multipleChoice',
        condition: "EMPLOYMENT == 3", // Only for self-employed
        options: [
            { id: 1, text: "Consulting" },
            { id: 2, text: "Retail/E-commerce" },
            { id: 3, text: "Food service" },
            { id: 4, text: "Professional services" },
            { id: 5, text: "Creative services" },
            { id: 6, text: "Other", next_if_selected: "BUSINESS_OTHER" }
        ],
        next: "INTERESTS",
        fallbackNext: "INTERESTS"
    },

    // 📝 Business other specification
    {
        id: "BUSINESS_OTHER",
        text: "Please describe your business:",
        type: 'freeText',
        freeTextPlaceholder: "Describe your business type...",
        next: "INTERESTS"
    },

    // 🎯 Retirement activities
    {
        id: "RETIREMENT",
        text: "How do you spend most of your time in retirement?",
        type: 'multipleChoice',
        condition: "AGE == 7", // Only for 65+ age group
        options: [
            { id: 1, text: "Volunteer work" },
            { id: 2, text: "Hobbies and crafts" },
            { id: 3, text: "Travel" },
            { id: 4, text: "Family time" },
            { id: 5, text: "Part-time work" },
            { id: 6, text: "Other activities", next_if_selected: "RETIREMENT_OTHER" }
        ],
        next: "INTERESTS",
        fallbackNext: "INTERESTS"
    },

    // 📝 Retirement other specification
    {
        id: "RETIREMENT_OTHER",
        text: "Please describe your other retirement activities:",
        type: 'freeText',
        freeTextPlaceholder: "Describe your activities...",
        next: "INTERESTS"
    },

    // 🎨 Interests with precision routing
    {
        id: "INTERESTS",
        text: "What are your main interests? (Select all that apply)",
        type: 'multipleChoice',
        options: [
            { id: 1, text: "Sports and fitness" },
            { id: 2, text: "Technology and gadgets" },
            { id: 3, text: "Arts and culture" },
            { id: 4, text: "Travel and adventure" },
            { id: 5, text: "Food and cooking" },
            { id: 6, text: "Music and entertainment" },
            { id: 7, text: "Reading and learning" },
            { id: 8, text: "Gaming", next_if_selected: "GAMING_DETAILS" },
            { id: 9, text: "Other interests", next_if_selected: "INTERESTS_OTHER" }
        ],
        next: "LOCATION"
    },

    // 🎮 Gaming details
    {
        id: "GAMING_DETAILS",
        text: "What type of gaming do you enjoy?",
        type: 'multipleChoice',
        options: [
            { id: 1, text: "Video games (console/PC)" },
            { id: 2, text: "Mobile games" },
            { id: 3, text: "Board games" },
            { id: 4, text: "Card games" },
            { id: 5, text: "Online multiplayer games" }
        ],
        next: "LOCATION"
    },

    // 📝 Interests other specification
    {
        id: "INTERESTS_OTHER",
        text: "Please specify your other interests:",
        type: 'freeText',
        freeTextPlaceholder: "Describe your interests...",
        next: "LOCATION"
    },

    // 🗺️ Location using commune selector
    {
        id: "LOCATION",
        text: "What is your municipality of residence?",
        type: 'commune',
        next: "TRANSPORT_MODE"
    },

    // 🚗 Primary transport mode
    {
        id: "TRANSPORT_MODE",
        text: "What is your primary mode of transportation?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Car (personal)", next: "CAR_DETAILS" },
            { id: 2, text: "Public transport", next: "PUBLIC_TRANSPORT" },
            { id: 3, text: "Bicycle", next: "BIKE_DETAILS" },
            { id: 4, text: "Walking", next: "SATISFACTION" },
            { id: 5, text: "Motorcycle/Scooter", next: "SATISFACTION" },
            { id: 6, text: "Mix of different modes", next: "MIXED_TRANSPORT" }
        ]
    },

    // 🚙 Car details
    {
        id: "CAR_DETAILS",
        text: "What type of car do you primarily use?",
        type: 'singleChoice',
        condition: "TRANSPORT_MODE == 1",
        options: [
            { id: 1, text: "Gasoline", next: "SATISFACTION" },
            { id: 2, text: "Diesel", next: "SATISFACTION" },
            { id: 3, text: "Hybrid", next: "SATISFACTION" },
            { id: 4, text: "Electric", next: "ELECTRIC_EXPERIENCE" },
            { id: 5, text: "Other", next: "CAR_OTHER" }
        ],
        fallbackNext: "SATISFACTION"
    },

    // ⚡ Electric car experience
    {
        id: "ELECTRIC_EXPERIENCE",
        text: "How has your experience been with electric vehicles?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Excellent", next: "SATISFACTION" },
            { id: 2, text: "Good", next: "SATISFACTION" },
            { id: 3, text: "Average", next: "ELECTRIC_CHALLENGES" },
            { id: 4, text: "Poor", next: "ELECTRIC_CHALLENGES" },
            { id: 5, text: "Very poor", next: "ELECTRIC_CHALLENGES" }
        ]
    },

    // 🔋 Electric car challenges
    {
        id: "ELECTRIC_CHALLENGES",
        text: "What challenges do you face with electric vehicles?",
        type: 'multipleChoice',
        options: [
            { id: 1, text: "Charging infrastructure" },
            { id: 2, text: "Range anxiety" },
            { id: 3, text: "Charging time" },
            { id: 4, text: "Purchase cost" },
            { id: 5, text: "Maintenance issues" },
            { id: 6, text: "Other", next_if_selected: "ELECTRIC_OTHER" }
        ],
        next: "SATISFACTION"
    },

    // 📝 Electric other challenges
    {
        id: "ELECTRIC_OTHER",
        text: "Please describe other electric vehicle challenges:",
        type: 'freeText',
        freeTextPlaceholder: "Describe your challenges...",
        next: "SATISFACTION"
    },

    // 📝 Car other specification
    {
        id: "CAR_OTHER",
        text: "Please specify your car type:",
        type: 'freeText',
        freeTextPlaceholder: "e.g., Hydrogen, Flex-fuel...",
        next: "SATISFACTION"
    },

    // 🚌 Public transport details
    {
        id: "PUBLIC_TRANSPORT",
        text: "Which public transport do you use most?",
        type: 'multipleChoice',
        condition: "TRANSPORT_MODE == 2",
        options: [
            { id: 1, text: "Bus" },
            { id: 2, text: "Metro/Subway" },
            { id: 3, text: "Train", next_if_selected: "TRAIN_STATION" },
            { id: 4, text: "Tram" },
            { id: 5, text: "Regional trains" },
            { id: 6, text: "Other", next_if_selected: "TRANSPORT_OTHER" }
        ],
        next: "TRANSPORT_FREQUENCY",
        fallbackNext: "SATISFACTION"
    },

    // 🚄 Train station selector
    {
        id: "TRAIN_STATION",
        text: "What is your main train station?",
        type: 'gare',
        next: "TRANSPORT_FREQUENCY"
    },

    // 📝 Transport other specification
    {
        id: "TRANSPORT_OTHER",
        text: "Please specify the other transport:",
        type: 'freeText',
        freeTextPlaceholder: "e.g., Ferry, Cable car...",
        next: "TRANSPORT_FREQUENCY"
    },

    // 🚴 Bike details
    {
        id: "BIKE_DETAILS",
        text: "What type of bicycle do you use?",
        type: 'singleChoice',
        condition: "TRANSPORT_MODE == 3",
        options: [
            { id: 1, text: "Traditional bicycle", next: "BIKE_STORAGE" },
            { id: 2, text: "Electric bicycle", next: "BIKE_STORAGE" },
            { id: 3, text: "Folding bicycle", next: "BIKE_STORAGE" },
            { id: 4, text: "Shared/rental bicycle", next: "BIKE_SHARING" }
        ],
        fallbackNext: "SATISFACTION"
    },

    // 🔒 Bike storage
    {
        id: "BIKE_STORAGE",
        text: "Where do you typically store your bicycle?",
        type: 'multipleChoice',
        options: [
            { id: 1, text: "At home (garage/basement)" },
            { id: 2, text: "Bike parking at work" },
            { id: 3, text: "Public bike racks" },
            { id: 4, text: "Bike storage facilities" },
            { id: 5, text: "Other", next_if_selected: "STORAGE_OTHER" }
        ],
        next: "SATISFACTION"
    },

    // 📝 Storage other specification
    {
        id: "STORAGE_OTHER",
        text: "Please describe your bike storage:",
        type: 'freeText',
        freeTextPlaceholder: "Describe where you store your bike...",
        next: "SATISFACTION"
    },

    // 🚲 Bike sharing details
    {
        id: "BIKE_SHARING",
        text: "Which bike sharing service do you use?",
        type: 'freeText',
        freeTextPlaceholder: "e.g., Vélib', Lime, local service...",
        next: "SATISFACTION"
    },

    // 🔄 Mixed transport modes
    {
        id: "MIXED_TRANSPORT",
        text: "Which combination of transport modes do you typically use?",
        type: 'multipleChoice',
        condition: "TRANSPORT_MODE == 6",
        options: [
            { id: 1, text: "Car + Public transport" },
            { id: 2, text: "Bike + Public transport" },
            { id: 3, text: "Walking + Public transport" },
            { id: 4, text: "Car + Bike" },
            { id: 5, text: "Multiple public transport types" },
            { id: 6, text: "Other combination", next_if_selected: "MIXED_OTHER" }
        ],
        next: "TRANSPORT_FREQUENCY",
        fallbackNext: "SATISFACTION"
    },

    // 📝 Mixed transport other
    {
        id: "MIXED_OTHER",
        text: "Please describe your transport combination:",
        type: 'freeText',
        freeTextPlaceholder: "Describe your typical transport mix...",
        next: "TRANSPORT_FREQUENCY"
    },

    // 📅 Transport frequency
    {
        id: "TRANSPORT_FREQUENCY",
        text: "How often do you use public transport?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Daily", next: "SATISFACTION" },
            { id: 2, text: "Several times a week", next: "SATISFACTION" },
            { id: 3, text: "Once a week", next: "SATISFACTION" },
            { id: 4, text: "Several times a month", next: "SATISFACTION" },
            { id: 5, text: "Rarely", next: "RARE_TRANSPORT_REASON" }
        ]
    },

    // 🤔 Rare transport reason
    {
        id: "RARE_TRANSPORT_REASON",
        text: "Why do you rarely use public transport?",
        type: 'multipleChoice',
        options: [
            { id: 1, text: "Not available in my area" },
            { id: 2, text: "Too expensive" },
            { id: 3, text: "Unreliable service" },
            { id: 4, text: "Prefer other modes" },
            { id: 5, text: "Safety concerns" },
            { id: 6, text: "Other reasons", next_if_selected: "RARE_OTHER" }
        ],
        next: "SATISFACTION"
    },

    // 📝 Rare transport other reason
    {
        id: "RARE_OTHER",
        text: "Please specify other reasons:",
        type: 'freeText',
        freeTextPlaceholder: "Explain why you rarely use public transport...",
        next: "SATISFACTION"
    },

    // 🚗 Work transport (conditional on employment)
    {
        id: "TRANSPORT_WORK",
        text: "How do you typically commute to work?",
        type: 'singleChoice',
        condition: "(EMPLOYMENT == 1 OR EMPLOYMENT == 2) AND REMOTE_WORK != 1", // Only for employed, non-remote workers
        options: [
            { id: 1, text: "Same as my primary transport", next: "SATISFACTION" },
            { id: 2, text: "Different from my primary transport", next: "WORK_TRANSPORT_DIFF" }
        ],
        fallbackNext: "SATISFACTION"
    },

    // 🏢 Different work transport
    {
        id: "WORK_TRANSPORT_DIFF",
        text: "What transport do you use for work commute?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Car", next: "SATISFACTION" },
            { id: 2, text: "Public transport", next: "WORK_STATION" },
            { id: 3, text: "Bicycle", next: "SATISFACTION" },
            { id: 4, text: "Walking", next: "SATISFACTION" },
            { id: 5, text: "Mixed modes", next: "SATISFACTION" }
        ]
    },

    // 🚉 Work station selector
    {
        id: "WORK_STATION",
        text: "Which station do you use for work commute?",
        type: 'station',
        next: "SATISFACTION"
    },

    // 😊 Satisfaction rating
    {
        id: "SATISFACTION",
        text: "How satisfied are you with your current transportation situation?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Very dissatisfied", next: "IMPROVEMENT" },
            { id: 2, text: "Dissatisfied", next: "IMPROVEMENT" },
            { id: 3, text: "Neutral", next: "GENDER" },
            { id: 4, text: "Satisfied", next: "RECOMMEND" },
            { id: 5, text: "Very satisfied", next: "RECOMMEND" }
        ]
    },

    // 🔧 Improvement suggestions
    {
        id: "IMPROVEMENT",
        text: "What improvements would make the biggest difference for you?",
        type: 'multipleChoice',
        options: [
            { id: 1, text: "Better reliability" },
            { id: 2, text: "Lower cost" },
            { id: 3, text: "More frequent service" },
            { id: 4, text: "Better accessibility" },
            { id: 5, text: "Improved safety" },
            { id: 6, text: "Better infrastructure" },
            { id: 7, text: "Environmental considerations" },
            { id: 8, text: "Other improvements", next_if_selected: "IMPROVEMENT_OTHER" }
        ],
        next: "GENDER"
    },

    // 📝 Improvement other specification
    {
        id: "IMPROVEMENT_OTHER",
        text: "Please describe other improvements you'd like to see:",
        type: 'freeText',
        freeTextPlaceholder: "Describe your improvement suggestions...",
        next: "GENDER"
    },

    // 👍 Recommendation
    {
        id: "RECOMMEND",
        text: "Would you recommend your current transportation to others?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Definitely", next: "GENDER" },
            { id: 2, text: "Probably", next: "GENDER" },
            { id: 3, text: "Maybe", next: "GENDER" },
            { id: 4, text: "Probably not", next: "RECOMMEND_WHY" },
            { id: 5, text: "Definitely not", next: "RECOMMEND_WHY" }
        ]
    },

    // 🤷 Why not recommend
    {
        id: "RECOMMEND_WHY",
        text: "Why wouldn't you recommend it?",
        type: 'freeText',
        freeTextPlaceholder: "Explain your concerns...",
        next: "GENDER"
    },

    // 👤 Gender demographics
    {
        id: "GENDER",
        text: "What is your gender?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Male", next: "INCOME" },
            { id: 2, text: "Female", next: "INCOME" },
            { id: 3, text: "Non-binary", next: "INCOME" },
            { id: 4, text: "Other", next: "INCOME" },
            { id: 5, text: "Prefer not to say", next: "POSTAL_CODE" }
        ]
    },

    // 💰 Income (conditional on not preferring not to say gender)
    {
        id: "INCOME",
        text: "What is your approximate annual household income?",
        type: 'singleChoice',
        condition: "GENDER != 5", // Only if didn't prefer not to say gender
        options: [
            { id: 1, text: "Under €25,000", next: "POSTAL_CODE" },
            { id: 2, text: "€25,000 - €50,000", next: "POSTAL_CODE" },
            { id: 3, text: "€50,000 - €75,000", next: "POSTAL_CODE" },
            { id: 4, text: "€75,000 - €100,000", next: "POSTAL_CODE" },
            { id: 5, text: "Over €100,000", next: "POSTAL_CODE" },
            { id: 6, text: "Prefer not to say", next: "POSTAL_CODE" }
        ],
        fallbackNext: "POSTAL_CODE"
    },

    // 📮 Postal code with validation
    {
        id: "POSTAL_CODE",
        text: "What is your postal code?",
        type: 'freeText',
        freeTextPlaceholder: "Enter your postal code (e.g., 75001)",
        validation: "numeric",
        next: "STREET_ADDRESS"
    },

    // 🏠 Street address selector
    {
        id: "STREET_ADDRESS",
        text: "What is your street name? (Optional)",
        type: 'street',
        next: "CONTACT"
    },

    // 📧 Contact information
    {
        id: "CONTACT",
        text: "Would you like to be contacted about follow-up studies?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Yes, I'm interested", next: "EMAIL" },
            { id: 2, text: "No, thank you", next: "COMMENTS" }
        ]
    },

    // 📧 Email collection
    {
        id: "EMAIL",
        text: "Please provide your email address:",
        type: 'freeText',
        freeTextPlaceholder: "your.email@example.com",
        next: "COMMENTS"
    },

    // 💬 Final comments
    {
        id: "COMMENTS",
        text: "Any additional comments or feedback about this survey or transportation in general?",
        type: 'freeText',
        freeTextPlaceholder: "Share any additional thoughts... (Optional)",
        next: "end"
    }
];

/*
🎯 FEATURES DEMONSTRATED IN THIS COMPREHENSIVE SURVEY:

📋 QUESTION TYPES:
✅ singleChoice - Basic single selection questions
✅ multipleChoice - Multiple selection with various options
✅ freeText - Text input with and without validation
✅ commune - French municipality selector
✅ station - Station/transport stop selector  
✅ street - Street name selector
✅ gare - Train station selector

🔀 CONDITIONAL LOGIC:
✅ condition - Show questions only if conditions are met
✅ conditionalText - Change question text based on previous answers
✅ conditionalNext - Route to different questions based on previous answers
✅ next_if_selected - Go to precision questions if specific options selected
✅ fallbackNext - Where to go if conditions aren't met
✅ Survey termination - End survey early for certain responses

🧠 ADVANCED FEATURES:
✅ Complex AND/OR conditions ("AGE >= 2 AND AGE <= 3")
✅ Nested conditional routing with multiple criteria
✅ Work station question integration (poste-travail-question-id)
✅ Numeric validation for postal codes and numbers
✅ Multiple precision questions for "Other" options
✅ Dynamic question text based on survey context
✅ Comprehensive demographic collection
✅ Multi-path survey flow with rejoining

📊 SURVEY FLOW COMPLEXITY:
- 20+ different possible paths through the survey
- Age-based routing (minors, students, workers, retirees)
- Employment-based conditional questions
- Transport mode specific deep dives
- Satisfaction-based improvement gathering
- Demographic collection with privacy options
- Optional contact information collection

This demonstrates EVERY feature implemented in the survey system!
*/ 
// 🚄 LAMBALLE-ARMOR TRAIN STATION INTERMODALITY SURVEY
// Based on AREP mobility study questionnaire

export const templateSurveyQuestions = [
    // Q1 - Station presence reason (filters survey flow)
    {
        id: "Q1",
        text: "Quelle est la raison de votre présence en gare ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Je vais prendre le train", next: "Q2_MONTANTS_TRAIN" },
            { id: 2, text: "Je vais prendre un car", next: "Q2_MONTANTS_CAR" },
            { id: 3, text: "J'accompagne des voyageurs qui partent / J'attends des voyageurs qui arrivent", next: "Q2_ACCOMPAGNATEURS" },
            { id: 4, text: "Autre raison (promenade, fréquentation commerce, descentes train vers Ville...)", next: "end" }
        ]
    },

    // ============ SECTION MONTANTS TRAIN ============

    // Q2 - Origin for train passengers
    {
        id: "Q2_MONTANTS_TRAIN",
        text: "Quelle est l'origine de votre déplacement ? D'où êtes-vous parti pour arriver à la gare ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Auray", next: "Q2A_MONTANTS_TRAIN" },
            { id: 2, text: "Brech", next: "Q2A_MONTANTS_TRAIN" },
            { id: 3, text: "Autre commune", next: "Q2_AUTRE_MONTANTS_TRAIN" }
        ]
    },

    // Q2 - Autre commune for train passengers
    {
        id: "Q2_AUTRE_MONTANTS_TRAIN",
        text: "Préciser nom de la commune :",
        type: 'commune',
        next: "Q3_MONTANTS_TRAIN"
    },

    // Q2a - Street in Auray/Brech for train passengers
    {
        id: "Q2A_MONTANTS_TRAIN",
        text: "De quelle rue venez-vous ?",
        type: 'street',
        next: "Q3_MONTANTS_TRAIN"
    },

    // Q3 - Transport mode to station for train passengers
    {
        id: "Q3_MONTANTS_TRAIN",
        text: "Quel mode de transport avez-vous utilisé pour vous rendre à la gare ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "À pied", next: "Q4_MONTANTS_TRAIN" },
            { id: 2, text: "En voiture -- en tant que conducteur", next: "Q3A_MONTANTS_TRAIN" },
            { id: 3, text: "En voiture -- en tant que passager", next: "Q4_MONTANTS_TRAIN" },
            { id: 4, text: "En covoiturage avec un autre usager du train", next: "Q4_MONTANTS_TRAIN" },
            { id: 5, text: "En bus/car", next: "Q3B_MONTANTS_TRAIN" },
            { id: 6, text: "À vélo", next: "Q3D_MONTANTS_TRAIN" },
            { id: 7, text: "En trottinette", next: "Q3D_MONTANTS_TRAIN" },
            { id: 8, text: "En Taxi/VTC", next: "Q4_MONTANTS_TRAIN" },
            { id: 9, text: "En 2 roues Motorisé (Moto, scooter...)", next: "Q3A_MONTANTS_TRAIN" },
            { id: 10, text: "En train - je fais une correspondance", next: "Q4_MONTANTS_TRAIN" },
            { id: 11, text: "Autre", next: "Q3_AUTRE_MONTANTS_TRAIN" }
        ]
    },

    // Q3 - Autre transport mode for train passengers
    {
        id: "Q3_AUTRE_MONTANTS_TRAIN",
        text: "Préciser le mode de transport :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q4_MONTANTS_TRAIN"
    },

    // Q3a - Vehicle parking location for train passengers
    {
        id: "Q3A_MONTANTS_TRAIN",
        text: "Où avez-vous stationné votre véhicule ?",
        image: '/plan.png',
        imageAlt: 'Plan de la gare montrant les zones de stationnement',
        type: 'singleChoice',
        options: [
            { id: 1, text: "Sur le parking de la gare Sud (côté Auray)", next: "Q3A_PRIME_MONTANTS_TRAIN" },
            { id: 2, text: "Sur le parking de la gare Nord (côté Brech)", next: "Q3A_PRIME_MONTANTS_TRAIN" },
            { id: 3, text: "Sur le parking Mermoz au Sud", next: "Q3A_PRIME_MONTANTS_TRAIN" },
            { id: 4, text: "Sur le parking Hulot au Sud", next: "Q3A_PRIME_MONTANTS_TRAIN" },
            { id: 5, text: "Sur une autre place en voirie ou parking au sud de la gare", next: "Q3A_PRIME_MONTANTS_TRAIN" },
            { id: 6, text: "Sur une autre place en voirie ou parking au nord de la gare", next: "Q3A_PRIME_MONTANTS_TRAIN" },
            { id: 7, text: "Sur un stationnement privé (box ou place de parking privée)", next: "Q3A_PRIME_MONTANTS_TRAIN" }
        ]
    },

    // Q3a' - Parking duration for train passengers
    {
        id: "Q3A_PRIME_MONTANTS_TRAIN",
        text: "Combien de temps allez-vous laisser votre voiture stationnée ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Moins de 2 heures", next: "Q4_MONTANTS_TRAIN" },
            { id: 2, text: "Une demi-journée (entre 2 et 4 heures)", next: "Q4_MONTANTS_TRAIN" },
            { id: 3, text: "Une journée entière (entre 4h et 12h)", next: "Q4_MONTANTS_TRAIN" },
            { id: 4, text: "2 à 3 jours", next: "Q4_MONTANTS_TRAIN" },
            { id: 5, text: "3 à 6 jours", next: "Q4_MONTANTS_TRAIN" },
            { id: 6, text: "1 semaine ou plus", next: "Q4_MONTANTS_TRAIN" }
        ]
    },

    // Q3b - Bus line for train passengers
    {
        id: "Q3B_MONTANTS_TRAIN",
        text: "Quelle ligne de bus/car avez-vous emprunté ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Ligne BreizhGo n°1 --(Belz-Plouharnel-Carnac-Auray)", next: "Q4_MONTANTS_TRAIN" },
            { id: 2, text: "Ligne BreizhGo n°5 (Baud-Auray-Vannes)", next: "Q4_MONTANTS_TRAIN" },
            { id: 3, text: "Ligne BreizhGo n°6 (Baden-Auray)", next: "Q4_MONTANTS_TRAIN" },
            { id: 4, text: "Ligne BreizhGo n°18 (Belz-Auray)", next: "Q4_MONTANTS_TRAIN" },
            { id: 5, text: "Ligne de car scolaire", next: "Q4_MONTANTS_TRAIN" },
            { id: 6, text: "Auray Bus -- ligne rouge", next: "Q4_MONTANTS_TRAIN" },
            { id: 7, text: "Auray Bus -- ligne jaune", next: "Q4_MONTANTS_TRAIN" },
            { id: 8, text: "Autre", next: "Q3B_AUTRE_MONTANTS_TRAIN" }
        ]
    },

    // Q3b - Autre bus line for train passengers
    {
        id: "Q3B_AUTRE_MONTANTS_TRAIN",
        text: "Préciser la ligne (Exemple : Flixbus, Blablabus) :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q4_MONTANTS_TRAIN"
    },

    // Q3d - Bike/scooter parking for train passengers
    {
        id: "Q3D_MONTANTS_TRAIN",
        text: "Où avez-vous stationné votre vélo/trottinette ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Sur les arceaux sous les abris côté parvis Sud", next: "Q4_MONTANTS_TRAIN" },
            { id: 2, text: "Sous l'abri sécurisé Breizhgo côté parvis Sud", next: "Q4_MONTANTS_TRAIN" },
            { id: 3, text: "Sur les arceaux sous les abris côté parking Nord", next: "Q4_MONTANTS_TRAIN" },
            { id: 4, text: "Sous l'abri sécurisé Breizhgo côté parking Nord", next: "Q4_MONTANTS_TRAIN" },
            { id: 5, text: "Je le transporte avec moi dans le train", next: "Q4_MONTANTS_TRAIN" },
            { id: 6, text: "Autre", next: "Q3D_AUTRE_MONTANTS_TRAIN" }
        ]
    },

    // Q3d - Autre bike parking for train passengers
    {
        id: "Q3D_AUTRE_MONTANTS_TRAIN",
        text: "Préciser l'emplacement :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q4_MONTANTS_TRAIN"
    },

    // Q4 - TER subscription for train passengers
    {
        id: "Q4_MONTANTS_TRAIN",
        text: "Possédez-vous un abonnement TER ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Oui", next: "Q4A_MONTANTS_TRAIN" },
            { id: 2, text: "Non", next: "Q5_MONTANTS_TRAIN" }
        ]
    },

    // Q4a - TER subscription type for train passengers
    {
        id: "Q4A_MONTANTS_TRAIN",
        text: "Quel type d'abonnement possédez-vous ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Hebdo", next: "Q5_MONTANTS_TRAIN" },
            { id: 2, text: "Mensuel", next: "Q5_MONTANTS_TRAIN" },
            { id: 3, text: "Annuel", next: "Q5_MONTANTS_TRAIN" },
            { id: 4, text: "Scolaire", next: "Q5_MONTANTS_TRAIN" },
            { id: 5, text: "Autre", next: "Q4A_AUTRE_MONTANTS_TRAIN" }
        ]
    },

    // Q4a - Autre subscription type for train passengers
    {
        id: "Q4A_AUTRE_MONTANTS_TRAIN",
        text: "Préciser le type d'abonnement :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q5_MONTANTS_TRAIN"
    },

    // Q5 - Final destination station for train passengers
    {
        id: "Q5_MONTANTS_TRAIN",
        text: "Quelle sera votre gare de destination finale ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Paris Montparnasse", next: "Q6_MONTANTS_TRAIN" },
            { id: 2, text: "Rennes", next: "Q6_MONTANTS_TRAIN" },
            { id: 3, text: "Lorient", next: "Q6_MONTANTS_TRAIN" },
            { id: 4, text: "Vannes", next: "Q6_MONTANTS_TRAIN" },
            { id: 5, text: "Nantes", next: "Q6_MONTANTS_TRAIN" },
            { id: 6, text: "Quimper", next: "Q6_MONTANTS_TRAIN" },
            { id: 7, text: "Redon", next: "Q6_MONTANTS_TRAIN" },
            { id: 8, text: "Questembert", next: "Q6_MONTANTS_TRAIN" },
            { id: 9, text: "Autre", next: "Q5_AUTRE_MONTANTS_TRAIN" }
        ]
    },

    // Q5 - Autre destination for train passengers
    {
        id: "Q5_AUTRE_MONTANTS_TRAIN",
        text: "Préciser la gare de destination :",
        type: 'gare',
        next: "Q6_MONTANTS_TRAIN"
    },

    // Q6 - Trip purpose for train passengers
    {
        id: "Q6_MONTANTS_TRAIN",
        text: "Quel est le motif de votre déplacement en train ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Je me rends sur mon lieu de travail", next: "Q7_MONTANTS_TRAIN" },
            { id: 2, text: "Je me rends sur mon lieu d'études", next: "Q7_MONTANTS_TRAIN" },
            { id: 3, text: "Je rentre à mon domicile principal", next: "Q6A_MONTANTS_TRAIN" },
            { id: 4, text: "Déplacement professionnel", next: "Q7_MONTANTS_TRAIN" },
            { id: 5, text: "Loisirs, tourisme", next: "Q7_MONTANTS_TRAIN" },
            { id: 6, text: "Autres", next: "Q6_AUTRE_MONTANTS_TRAIN" }
        ]
    },

    // Q6 - Autre trip purpose for train passengers
    {
        id: "Q6_AUTRE_MONTANTS_TRAIN",
        text: "Préciser le motif (Achats, démarches administratives, RDV médical...) :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q7_MONTANTS_TRAIN"
    },

    // Q6a - Reason for coming to Auray for train passengers
    {
        id: "Q6A_MONTANTS_TRAIN",
        text: "Quel était la raison de votre venue à Auray ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Travail", next: "Q7_MONTANTS_TRAIN" },
            { id: 2, text: "Études", next: "Q7_MONTANTS_TRAIN" },
            { id: 3, text: "Déplacement professionnel", next: "Q7_MONTANTS_TRAIN" },
            { id: 4, text: "Loisirs, tourisme", next: "Q7_MONTANTS_TRAIN" },
            { id: 5, text: "Autres (Achats, démarches administratives, RDV médical, visite...)", next: "Q7_MONTANTS_TRAIN" }
        ]
    },

    // Q7 - Improvement suggestions for train passengers
    {
        id: "Q7_MONTANTS_TRAIN",
        text: "Selon vous, que faudrait-il faire en priorité pour améliorer les conditions d'accès à cette gare ?",
        type: 'freeText',
        freeTextPlaceholder: "Noter seulement les mots clés",
        next: "end"
    },


    // ============ SECTION MONTANTS CAR ============
    {
        id: "Q2_MONTANTS_CAR",
        text: "Quelle est l'origine de votre déplacement ? D'où êtes-vous parti pour arriver à la gare routière ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Auray", next: "Q2A_MONTANTS_CAR" },
            { id: 2, text: "Brech", next: "Q2A_MONTANTS_CAR" },
            { id: 3, text: "Autre commune", next: "Q2_AUTRE_MONTANTS_CAR" }
        ]
    },

    // Q2 - Autre commune for bus/car passengers
    {
        id: "Q2_AUTRE_MONTANTS_CAR",
        text: "Préciser nom de la commune :",
        type: 'commune',
        next: "Q3_MONTANTS_CAR"
    },

    // Q2a - Street in Auray/Brech for bus/car passengers
    {
        id: "Q2A_MONTANTS_CAR",
        text: "De quelle rue venez-vous ?",
        type: 'street',
        next: "Q3_MONTANTS_CAR"
    },

    // Q3 - Transport mode to bus station
    {
        id: "Q3_MONTANTS_CAR",
        text: "Quel mode de transport avez-vous utilisé pour vous rendre à la gare routière ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "À pied", next: "Q4_MONTANTS_CAR" },
            { id: 2, text: "En voiture -- en tant que conducteur", next: "Q3A_MONTANTS_CAR" },
            { id: 3, text: "En voiture -- en tant que passager", next: "Q4_MONTANTS_CAR" },
            { id: 4, text: "En covoiturage avec un autre usager du train", next: "Q4_MONTANTS_CAR" },
            { id: 5, text: "En train", next: "Q3B_MONTANTS_CAR" },
            { id: 6, text: "À vélo", next: "Q3D_MONTANTS_CAR" },
            { id: 7, text: "En trottinette", next: "Q3D_MONTANTS_CAR" },
            { id: 8, text: "En Taxi/VTC", next: "Q4_MONTANTS_CAR" },
            { id: 9, text: "En 2 roues Motorisé (Moto, scooter...)", next: "Q3A_MONTANTS_CAR" },
            { id: 10, text: "En bus/car - je fais une correspondance", next: "Q4_MONTANTS_CAR" },
            { id: 11, text: "Autre", next: "Q3_AUTRE_MONTANTS_CAR" }
        ]
    },

    // Q3 - Autre transport mode for bus/car passengers
    {
        id: "Q3_AUTRE_MONTANTS_CAR",
        text: "Préciser le mode de transport :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q4_MONTANTS_CAR"
    },

    // Q3a - Vehicle parking for bus/car passengers
    {
        id: "Q3A_MONTANTS_CAR",
        text: "Où avez-vous stationné votre véhicule ?",
        image: '/plan.png',
        imageAlt: 'Plan de la gare montrant les zones de stationnement',
        type: 'singleChoice',
        options: [
            { id: 1, text: "Sur le parking de la gare Sud (côté Auray)", next: "Q3A_PRIME_MONTANTS_CAR" },
            { id: 2, text: "Sur le parking de la gare Nord (côté Brech)", next: "Q3A_PRIME_MONTANTS_CAR" },
            { id: 3, text: "Sur le parking Mermoz au Sud", next: "Q3A_PRIME_MONTANTS_CAR" },
            { id: 4, text: "Sur le parking Hulot au Sud", next: "Q3A_PRIME_MONTANTS_CAR" },
            { id: 5, text: "Sur une autre place en voirie ou parking au sud de la gare", next: "Q3A_PRIME_MONTANTS_CAR" },
            { id: 6, text: "Sur une autre place en voirie ou parking au nord de la gare", next: "Q3A_PRIME_MONTANTS_CAR" },
            { id: 7, text: "Sur un stationnement privé (box ou place de parking privée)", next: "Q3A_PRIME_MONTANTS_CAR" }
        ]
    },

    // Q3a' - Parking duration for bus/car passengers
    {
        id: "Q3A_PRIME_MONTANTS_CAR",
        text: "Combien de temps allez-vous laisser votre voiture stationnée ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Moins de 2 heures", next: "Q4_MONTANTS_CAR" },
            { id: 2, text: "Une demi-journée (entre 2 et 4 heures)", next: "Q4_MONTANTS_CAR" },
            { id: 3, text: "Une journée entière (entre 4h et 12h)", next: "Q4_MONTANTS_CAR" },
            { id: 4, text: "2 à 3 jours", next: "Q4_MONTANTS_CAR" },
            { id: 5, text: "3 à 6 jours", next: "Q4_MONTANTS_CAR" },
            { id: 6, text: "1 semaine ou plus", next: "Q4_MONTANTS_CAR" }
        ]
    },

    // Q3b - Train type for bus/car passengers
    {
        id: "Q3B_MONTANTS_CAR",
        text: "Avec quel type de train êtes-vous arrivé ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "TER", next: "Q4_MONTANTS_CAR" },
            { id: 2, text: "TGV", next: "Q4_MONTANTS_CAR" }
        ]
    },

    // Q3d - Bike/scooter parking for bus/car passengers
    {
        id: "Q3D_MONTANTS_CAR",
        text: "Où avez-vous stationné votre vélo/trottinette ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Sur les arceaux sous les abris côté parvis Sud", next: "Q4_MONTANTS_CAR" },
            { id: 2, text: "Sous l'abri sécurisé Breizhgo côté parvis Sud", next: "Q4_MONTANTS_CAR" },
            { id: 3, text: "Sur les arceaux sous les abris côté parking Nord", next: "Q4_MONTANTS_CAR" },
            { id: 4, text: "Sous l'abri sécurisé Breizhgo côté parking Nord", next: "Q4_MONTANTS_CAR" },
            { id: 5, text: "Je le transporte avec moi dans le train", next: "Q4_MONTANTS_CAR" },
            { id: 6, text: "Autre", next: "Q3D_AUTRE_MONTANTS_CAR" }
        ]
    },

    // Q3d - Autre bike parking for bus/car passengers
    {
        id: "Q3D_AUTRE_MONTANTS_CAR",
        text: "Préciser l'emplacement :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q4_MONTANTS_CAR"
    },

    // Q4 - BreizhGo subscription for bus/car passengers
    {
        id: "Q4_MONTANTS_CAR",
        text: "Possédez-vous un abonnement car BreizhGo ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Oui", next: "Q4A_MONTANTS_CAR" },
            { id: 2, text: "Non", next: "Q5_MONTANTS_CAR" }
        ]
    },

    // Q4a - BreizhGo subscription type for bus/car passengers
    {
        id: "Q4A_MONTANTS_CAR",
        text: "Quel type d'abonnement possédez-vous ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Hebdo", next: "Q5_MONTANTS_CAR" },
            { id: 2, text: "Mensuel", next: "Q5_MONTANTS_CAR" },
            { id: 3, text: "Annuel", next: "Q5_MONTANTS_CAR" },
            { id: 4, text: "Scolaire", next: "Q5_MONTANTS_CAR" },
            { id: 5, text: "Autre", next: "Q4A_AUTRE_MONTANTS_CAR" }
        ]
    },

    // Q4a - Autre subscription type for bus/car passengers
    {
        id: "Q4A_AUTRE_MONTANTS_CAR",
        text: "Préciser le type d'abonnement :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q5_MONTANTS_CAR"
    },

    // Q5 - Final destination commune for bus/car passengers
    {
        id: "Q5_MONTANTS_CAR",
        text: "Quelle sera votre commune de descente ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Carnac", next: "Q6_MONTANTS_CAR" },
            { id: 2, text: "Crac'h", next: "Q6_MONTANTS_CAR" },
            { id: 3, text: "La Trinité-sur-mer", next: "Q6_MONTANTS_CAR" },
            { id: 4, text: "Belz", next: "Q6_MONTANTS_CAR" },
            { id: 5, text: "Erdeven", next: "Q6_MONTANTS_CAR" },
            { id: 6, text: "Ploemel", next: "Q6_MONTANTS_CAR" },
            { id: 7, text: "Baud", next: "Q6_MONTANTS_CAR" },
            { id: 8, text: "Brech", next: "Q6_MONTANTS_CAR" },
            { id: 9, text: "Pluvigner", next: "Q6_MONTANTS_CAR" },
            { id: 10, text: "Auray", next: "Q6_MONTANTS_CAR" },
            { id: 11, text: "Camors", next: "Q6_MONTANTS_CAR" },
            { id: 12, text: "Pluneret", next: "Q6_MONTANTS_CAR" },
            { id: 13, text: "Sainte-Anne-d'Auray", next: "Q6_MONTANTS_CAR" },
            { id: 14, text: "Plescop", next: "Q6_MONTANTS_CAR" },
            { id: 15, text: "Autre", next: "Q5_AUTRE_MONTANTS_CAR" }
        ]
    },

    // Q5 - Autre destination commune for bus/car passengers
    {
        id: "Q5_AUTRE_MONTANTS_CAR",
        text: "Préciser la commune de descente :",
        type: 'commune',
        next: "Q6_MONTANTS_CAR"
    },

    // Q6 - Trip purpose for bus/car passengers
    {
        id: "Q6_MONTANTS_CAR",
        text: "Quel est le motif de votre déplacement en car ?",
        type: 'singleChoice',
        options: [
            { id: 7, text: "Je me rends sur mon lieu de travail", next: "Q7_MONTANTS_CAR" },
            { id: 8, text: "Je me rends sur mon lieu d'études", next: "Q7_MONTANTS_CAR" },
            { id: 9, text: "Je rentre à mon domicile principal", next: "Q6A_MONTANTS_CAR" },
            { id: 10, text: "Déplacement professionnel", next: "Q7_MONTANTS_CAR" },
            { id: 11, text: "Loisirs, tourisme", next: "Q7_MONTANTS_CAR" },
            { id: 12, text: "Autres", next: "Q6_AUTRE_MONTANTS_CAR" }
        ]
    },

    // Q6 - Autre trip purpose for bus/car passengers
    {
        id: "Q6_AUTRE_MONTANTS_CAR",
        text: "Préciser le motif (Achats, démarches administratives, RDV médical...) :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q7_MONTANTS_CAR"
    },

    // Q6a - Reason for coming to Auray for bus/car passengers
    {
        id: "Q6A_MONTANTS_CAR",
        text: "Quel était la raison de votre venue à Auray ?",
        type: 'singleChoice',
        options: [
            { id: 6, text: "Travail", next: "Q7_MONTANTS_CAR" },
            { id: 7, text: "Études", next: "Q7_MONTANTS_CAR" },
            { id: 8, text: "Déplacement professionnel", next: "Q7_MONTANTS_CAR" },
            { id: 9, text: "Loisirs, tourisme", next: "Q7_MONTANTS_CAR" },
            { id: 10, text: "Autres (Achats, démarches administratives, RDV médical, visite...)", next: "Q7_MONTANTS_CAR" }
        ]
    },

    // Q7 - Improvement suggestions for bus/car passengers
    {
        id: "Q7_MONTANTS_CAR",
        text: "Selon vous, que faudrait-il faire en priorité pour améliorer les conditions d'accès à cette gare routière ?",
        type: 'freeText',
        freeTextPlaceholder: "Noter seulement les mots clés",
        next: "end"
    },

    // SECTION ACCOMPAGNATEURS
    {
        id: "Q2_ACCOMPAGNATEURS",
        text: "Quelle est l'origine de votre déplacement ? D'où êtes-vous parti pour arriver à la gare ?",
        type: 'singleChoice',
        options: [
            { id: 1, text: "Auray", next: "Q2A_ACCOMPAGNATEURS" },
            { id: 2, text: "Brech", next: "Q2A_ACCOMPAGNATEURS" },
            { id: 3, text: "Autre commune", next: "Q2_AUTRE_ACCOMPAGNATEURS" }
        ]
    },

    // Q2 - Autre commune for companions
    {
        id: "Q2_AUTRE_ACCOMPAGNATEURS",
        text: "Préciser nom de la commune :",
        type: 'commune',
        next: "Q3_ACCOMPAGNATEURS"
    },

    // Q2a - Street in Auray/Brech for companions
    {
        id: "Q2A_ACCOMPAGNATEURS",
        text: "De quelle rue venez-vous ?",
        type: 'street',
        next: "Q3_ACCOMPAGNATEURS"
    },

    // Q3 - Transport mode for companions
    {
        id: "Q3_ACCOMPAGNATEURS",
        text: "Quel mode de transport avez-vous utilisé pour vous rendre à la gare ?",
       
        type: 'singleChoice',
        options: [
            { id: 1, text: "À pied", next: "Q4_ACCOMPAGNATEURS" },
            { id: 2, text: "En voiture -- en tant que conducteur", next: "Q3A_ACCOMPAGNATEURS" },
            { id: 3, text: "En voiture -- en tant que passager", next: "Q4_ACCOMPAGNATEURS" },
            { id: 4, text: "En covoiturage avec un autre usager du train", next: "Q4_ACCOMPAGNATEURS" },
            { id: 5, text: "En bus/car", next: "Q4_ACCOMPAGNATEURS" },
            { id: 6, text: "À vélo", next: "Q4_ACCOMPAGNATEURS" },
            { id: 7, text: "En trottinette", next: "Q4_ACCOMPAGNATEURS" },
            { id: 8, text: "En Taxi/VTC", next: "Q4_ACCOMPAGNATEURS" },
            { id: 9, text: "En 2 roues Motorisé (Moto, scooter...)", next: "Q3A_ACCOMPAGNATEURS" },
            { id: 10, text: "Autre", next: "Q3_AUTRE_ACCOMPAGNATEURS" }
        ]
    },

    // Q3 - Autre transport for companions
    {
        id: "Q3_AUTRE_ACCOMPAGNATEURS",
        text: "Préciser le mode de transport :",
        type: 'freeText',
        freeTextPlaceholder: "Préciser",
        next: "Q4_ACCOMPAGNATEURS"
    },

    // Q3a - Vehicle parking for companions
    {
        id: "Q3A_ACCOMPAGNATEURS",
        text: "Où avez-vous stationné votre véhicule ?",
        image: '/plan.png',
        imageAlt: 'Plan de la gare montrant les zones de stationnement',
        type: 'singleChoice',
        options: [
            { id: 1, text: "Sur le parking de la gare Sud (côté Auray)", next: "Q4_ACCOMPAGNATEURS" },
            { id: 2, text: "Sur le parking de la gare Nord (côté Brech)", next: "Q4_ACCOMPAGNATEURS" },
            { id: 3, text: "Sur le parking Mermoz au Sud", next: "Q4_ACCOMPAGNATEURS" },
            { id: 4, text: "Sur le parking Hulot au Sud", next: "Q4_ACCOMPAGNATEURS" },
            { id: 5, text: "Sur une autre place en voirie ou parking au sud de la gare", next: "Q4_ACCOMPAGNATEURS" },
            { id: 6, text: "Sur une autre place en voirie ou parking au nord de la gare", next: "Q4_ACCOMPAGNATEURS" },
            { id: 7, text: "Sur un stationnement privé (box ou place de parking privée)", next: "Q4_ACCOMPAGNATEURS" }
        ]
    },

    // Q4 - Final question for companions
    {
        id: "Q4_ACCOMPAGNATEURS",
        text: "Selon vous, que faudrait-il faire en priorité pour améliorer les conditions d'accès à cette gare ?",
        type: 'freeText',
        freeTextPlaceholder: "Noter seulement les mots clés",
        next: "end"
    }
];


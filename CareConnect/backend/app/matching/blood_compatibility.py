def is_compatible(donor_group, required_group):

    compatibility = {

        "O-": ["O-"],

        "O+": ["O-", "O+"],

        "A-": ["O-", "A-"],

        "A+": ["O-", "O+", "A-", "A+"],

        "B-": ["O-", "B-"],

        "B+": ["O-", "O+", "B-", "B+"],

        "AB-": [
            "O-",
            "A-",
            "B-",
            "AB-"
        ],

        "AB+": [
            "O-",
            "O+",
            "A-",
            "A+",
            "B-",
            "B+",
            "AB-",
            "AB+"
        ]
    }


    return donor_group in compatibility.get(
        required_group,
        []
    )
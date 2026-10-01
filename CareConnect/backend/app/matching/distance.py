from math import radians, sin, cos, sqrt, atan2


def calculate_distance(
    lat1,
    lon1,
    lat2,
    lon2
):

    # Earth radius in kilometers
    R = 6371


    lat1 = radians(lat1)
    lat2 = radians(lat2)

    lon1 = radians(lon1)
    lon2 = radians(lon2)


    dlat = lat2 - lat1
    dlon = lon2 - lon1


    a = (
        sin(dlat / 2) ** 2
        +
        cos(lat1)
        *
        cos(lat2)
        *
        sin(dlon / 2) ** 2
    )


    c = 2 * atan2(
        sqrt(a),
        sqrt(1 - a)
    )


    distance = R * c


    return round(distance, 2)
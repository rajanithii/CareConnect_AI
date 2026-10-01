from app.ai.emergency_analyzer import analyze_emergency


message = """
My father met with an accident.
Need O+ blood urgently at Apollo Chennai
"""


result = analyze_emergency(message)

print(result)
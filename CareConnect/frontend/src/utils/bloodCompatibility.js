// Donor -> list of recipient blood groups they can donate to
const DONOR_TO_RECIPIENTS = {
  'O-': ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

export function canDonateTo(donorGroup, recipientGroup) {
  return DONOR_TO_RECIPIENTS[donorGroup]?.includes(recipientGroup) ?? false;
}

export function compatibleDonorsFor(recipientGroup) {
  return Object.keys(DONOR_TO_RECIPIENTS).filter((donor) =>
    DONOR_TO_RECIPIENTS[donor].includes(recipientGroup)
  );
}

export function isUniversalDonor(group) {
  return group === 'O-';
}

export function isUniversalRecipient(group) {
  return group === 'AB+';
}

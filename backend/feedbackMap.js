// Machine Learning Model Feedback (Classification-based)
const FEEDBACK_MAP = {
    'HSA_correct_C': 'Great closed stance. Maintain that shoulder line.',
    'HSA_correct_O': 'Strong open stance. Keep breathing steadily.',
    'armsTooHigh_C': 'Lower your arms slightly to align with the shoulders.',
    'armsTooHigh_O': 'Lower your arms slightly to align with the shoulders.',
    'armsTooLow_C': 'Lift your arms a bit higher—aim for shoulder height.',
    'armsTooLow_O': 'Lift your arms a bit higher—aim for shoulder height.',
};

const DEFAULT_FEEDBACK = 'Nice tempo! Stay controlled and keep breathing.';

// Deep Learning Model Feedback (Autoencoder anomaly detection)
const DL_FEEDBACK_MAP = {
    'GOOD_FORM': 'Excellent form! Your posture matches the correct pattern.',
    'BAD_FORM': 'Form needs adjustment. Check the highlighted joints.',
};

// Joint-specific feedback for DL model
const JOINT_FEEDBACK = {
    'Left Shoulder': 'Adjust your left shoulder position.',
    'Right Shoulder': 'Adjust your right shoulder position.',
    'Left Elbow': 'Check your left elbow angle.',
    'Right Elbow': 'Check your right elbow angle.',
    'Left Wrist': 'Reposition your left wrist.',
    'Right Wrist': 'Reposition your right wrist.',
    'Left Hip': 'Align your left hip properly.',
    'Right Hip': 'Align your right hip properly.',
    'Left Knee': 'Check your left knee positioning.',
    'Right Knee': 'Check your right knee positioning.',
    'Left Ankle': 'Adjust your left ankle stance.',
    'Right Ankle': 'Adjust your right ankle stance.',
};

/**
 * Generate feedback for Deep Learning model predictions
 * @param {string} label - 'GOOD_FORM' or 'BAD_FORM'
 * @param {Array} badJoints - Array of {name, error, index} objects
 * @returns {string} Feedback message
 */
function getDLFeedback(label, badJoints = []) {
    if (label === 'GOOD_FORM') {
        return DL_FEEDBACK_MAP['GOOD_FORM'];
    }
    
    if (!badJoints || badJoints.length === 0) {
        return DL_FEEDBACK_MAP['BAD_FORM'];
    }
    
    // Get top 3 problematic joints
    const topJoints = badJoints.slice(0, 3);
    const jointFeedback = topJoints
        .map(joint => JOINT_FEEDBACK[joint.name] || `Check your ${joint.name}`)
        .join(' ');
    
    return `Form needs work: ${jointFeedback}`;
}

module.exports = {
    FEEDBACK_MAP,
    DEFAULT_FEEDBACK,
    DL_FEEDBACK_MAP,
    JOINT_FEEDBACK,
    getDLFeedback
};

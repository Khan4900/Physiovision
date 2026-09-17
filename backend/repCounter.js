const EXERCISE_TYPE = process.env.Physiovision_EXERCISE || 'Horizontal Shoulder Abduction';

function updateRepState(label, currentState) {
    const state = { ...currentState };
    if (!label) return state;

    const labelLower = label.toLowerCase();
    state.isCorrectForm = labelLower.includes('correct');

    if (EXERCISE_TYPE.toLowerCase().includes('shoulder')) {
        if (labelLower.includes('_c')) {
            state.stage = 'close';
        } else if (state.stage === 'close' && labelLower.includes('_o')) {
            state.stage = 'open';
            state.repCount = (state.repCount || 0) + 1;
        }
    } else {
        if (labelLower.includes('_down')) {
            state.stage = 'down';
        } else if (state.stage === 'down' && labelLower.includes('_up')) {
            state.stage = 'up';
            state.repCount = (state.repCount || 0) + 1;
        }
    }
    return state;
}

module.exports = {
    updateRepState,
    EXERCISE_TYPE
};

// Emergency fix for button click
console.log('🔧 Emergency fix script loaded');

document.addEventListener('DOMContentLoaded', function() {
    console.log('🔧 DOM loaded, finding button...');
    
    const submitBtn = document.getElementById('submitBtn');
    console.log('🔍 Button found:', submitBtn);
    
    if (submitBtn) {
        submitBtn.addEventListener('click', function(e) {
            console.log('✅✅✅ BUTTON CLICKED! ✅✅✅');
            e.preventDefault();
            e.stopPropagation();
            
            if (window.formSubmissionSuccess) {
                console.log('Already submitted');
                return;
            }
            
            // Call the form submit handler directly WITHOUT triggering form event
            if (typeof handleFormSubmit === 'function') {
                handleFormSubmit();
            } else {
                console.error('❌ handleFormSubmit function not found!');
            }
        });
        console.log('✅ Click handler attached');
    } else {
        console.error('❌ Button not found!');
    }
});

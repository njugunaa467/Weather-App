function formatDateTime(timestamp) {
    const date = new Date(timestamp * 1000); 
    const options = {
        weekday: 'long',     
        year: 'numeric',     
        month: 'long',       
        day: 'numeric',      
        hour: '2-digit',     
        minute: '2-digit',   
        second: '2-digit',   
        hour12: true         
    };
    return date.toLocaleDateString('en-US', options) + ' ' + date.toLocaleTimeString('en-US', options);
}

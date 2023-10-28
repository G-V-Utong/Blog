function timeoutPromise() {
    return new Promise((resolve, reject) => {
    setTimeout(()=> {
        resolve();
    }, 1000)
});
}

module.exports = timeoutPromise;
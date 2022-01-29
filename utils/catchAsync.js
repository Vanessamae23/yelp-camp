module.exports = func => {
    return (req, res, next) => {
        // executes the function but catches any error. So it is a function tht accepts another function 
        // and passes it to next if there is an error
        func(req, res, next).catch(next)
    }
}
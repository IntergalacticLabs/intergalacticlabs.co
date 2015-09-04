var config = module.exports = {
    jwt: {
        secret: 'devsecret',
        algorithm: 'HS256'
    },
    app: {
        port: 8080
    }
};

if (process.env.NODE_ENV === 'production') {
    config.jwt.secret = process.env.JWT_SECRET
}
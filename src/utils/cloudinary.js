const cloudinary = require('cloudinary').v2
cloudinary.config({
    cloud_name: 'df8upxysb',
    api_key: '182685957343566',
    api_secret: 'HroOJ0Lc52sn6d-OW-xGde92egQ'
})


const uploadToCloudinary = async (locaFilePath, filename) => {
    return cloudinary.uploader
        .upload(locaFilePath)
        .then(result => {
            return {
                message: "Success",
                url: result.url,
                result

            }
        });
}

module.exports = uploadToCloudinary
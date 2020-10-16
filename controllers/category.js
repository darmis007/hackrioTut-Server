const Category = require('../models/category');
const Link = require('../models/link');
const slugify = require('slugify');
const formidable = require('formidable')
const AWS = require('aws-sdk')
const uuidv4 = require('uuid/v4')
const fs = require('fs')

// s3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: process.env.AWS_REGION
})

// Bucket OFF switch ON when to use
exports.create = (req, res) => {
    const { name, image, content} = req.body
    //console.table({name,image,content})
    //const pattern = `/*data:image\/\w+;base64,/`
    const base64Data = new Buffer.from(image.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    const type = image.split(';')[0].split('/')[1];

    const params = {
        Bucket: 'hackriodm7rockstar',
        Key: `category/${uuidv4()}.${type}`,
        Body: base64Data,
        ACL: 'public-read',
        ContentEncoding: 'base64',
        ContentType: `image/${type}`
    }

    const slug = slugify(name)
    let category = new Category({name, content, slug})

    s3.upload(params, (err, data) => {
    if(err) return res.status(400).json({error: `Upload to  S3 failed for ason - ${err}`})
    console.log("AWS UPLOAD RES DATA", data)
    category.image.url = data.Location
    category.image.key = data.Key

        // save to db
    category.save((err, success) => {
        if(err) return res.status(400).json({error: `Error saving category iled for reason - ${err}`})
        return res.json(success)
    })
    })
}
//exports.create = (req, res) => {
//    let form = new formidable.IncomingForm()
//    form.parse(req, (err, fields, files) => {
//        if (err) {
//            return res.status(400).json({
//                error: "Image could not be uploaded"
//            })
//        }
//        const {name, content} = fields
//        const {image} = files
//
//        const slug = slugify(name)
//        let category = new Category({name, content, slug})
//        if (image.size > 2000000) {
//            return res.status(400).json({
//                error: "Image should be less than 2mb"
//            })
//        }
//        // upload image to s3
//        const params = {
//            Bucket: 'hackriodm7rockstar',
//            Key: `category/${uuidv4()}`,
//            Body: fs.readFileSync(image.path),
//            ACL: 'public-read',
//            ContentType: 'image/jpg'
//        }
//
//        s3.upload(params, (err, data) => {
//            if(err) return res.status(400).json({error: `Upload to  S3 failed for reason - ${err}`})
//            console.log("AWS UPLOAD RES DATA", data)
//            category.image.url = data.Location
//            category.image.key = data.Key
//
//            // save to db
//            category.save((err, success) => {
//                if(err) return res.status(400).json({error: `Error saving category failed for reason - ${err}`})
//                return res.json(success)
//            })
//        })
//    })
//}

//exports.create = (req, res) => {
//    const { name, content } = req.body;
//    const slug = slugify(name);
//    const image = {
//        url: `https://via.placeholder.com/200x150.png?text=${process.env.CLIENT_URL}`,
//        key: '123'
//    };
//
//    const category = new Category({ name, slug, image });
//    category.postedBy = req.user._id;
//
//    category.save((err, data) => {
//        if (err) {
//            console.log('CATEGORY CREATE ERR', err);
//            return res.status(400).json({
//                error: 'Category create failed'
//            });
//        }
//        res.json(data);
//    });
//};

exports.list = (req, res) => {
    Category.find({}).exec((err, data) => {
        if (err) {
            return res.status(400).json({
                error: 'Categories could not load'
            })
        }
        return res.json(data)
    })
};


exports.read = (req, res) => {
    const { slug } = req.params;
    let limit = req.body.limit ? parseInt(req.body.limit) : 10;
    let skip = req.body.skip ? parseInt(req.body.skip) : 0;

    Category.findOne({ slug })
        .populate('postedBy', '_id name username')
        .exec((err, category) => {
            if (err) {
                return res.status(400).json({
                    error: 'Could not load category'
                });
            }
            // res.json(category);
            Link.find({ categories: category })
                .populate('postedBy', '_id name username')
                .populate('categories', 'name')
                .sort({ createdAt: -1 })
                .limit(limit)
                .skip(skip)
                .exec((err, links) => {
                    if (err) {
                        return res.status(400).json({
                            error: 'Could not load links of a category'
                        });
                    }
                    res.json({ category, links });
                });
        });
};

exports.update = (req, res) => {
    //
};

exports.remove = (req, res) => {
    //
};
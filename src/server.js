const express = require('express');
const ejs = require('ejs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser')
const app = express();



//middleware
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}));


//Port Server
app.listen(3000);


// storage engine
const storage = multer.diskStorage({
    destination: './public/uploads',
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

//Filter in Uploading
const FileFilter = function(req,file,cb){
    const filetypes = /jpeg|png|jpg/;
    const extname = filetypes.test(path.extname(file.originalname).toLocaleLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (mimetype&extname){
        return cb(null,true);
    }else{
        cb('Error,upload jpeg & png & jpg Images Only!')
    }
}

//upload File
const upload = multer({
    storage: storage,
    fileFilter:FileFilter,
    limits:{fileSize: 1024000},
}).single('uploadedFile')


// view engine
app.set('view engine', 'ejs');
app.set('views', './src/views');
app.use(express.static('./public'));



//apis
app.get('/', (req, res) => {
    res.render('index', {
        msg: ''
    })
})

//Post File
app.post('/', (req, res) => {
    upload(req, res, (err) => {
        if (err) {
            res.render('index', {
                msg: (err)
            })
        } else {
            if (req.file === undefined) {
                res.render('index', {
                    msg: 'Select file to upload'
                })
            } else {
                res.render('index', {
                    msg: 'File Uploaded SuccessFully'
                })
            }
        }
    })
})

//Get Files
app.get('/files', (req, res) => {
    fs.readdir('public/uploads', (err, files) => {
        res.render('files', {
            Files: files
        })
    })
})

//Delet Files
app.post('/delete/:file', (req, res, next) => {
    deletefile = 'public/uploads/'+req.params.file;
    fs.unlink(deletefile, (err) => {
        if (err) {return err}
        fs.readdir('public/uploads', (err, files) => {
            res.render('files', {
                Files: files
            })
        })  
    })
})

//Rename Files
app.post('/rename/:file', (req, res) => {
    recName = req.body.rename;
    fileName = req.params.file;
    ext = fileName.split('.');
    extension = ext[1];
    fileDirectory = 'public/uploads/'
    newName = recName + '.' + extension;
    fs.rename(fileDirectory+fileName, fileDirectory+newName, (err) => {
        if(err) {console.log(err)};
        fs.readdir('public/uploads', (err, files) => {
            res.render('files', {
                Files: files
            })
        })  
    })
})

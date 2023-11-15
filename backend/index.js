const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB connection
mongoose.connect('mongodb://localhost/pdfapp');

// Create a Mongoose model for PDF documents
const Pdf = mongoose.model('Pdf', {
    name: String,
    data: Buffer,
});

// Multer storage configuration
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Display the form to upload a PDF
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Handle PDF upload
app.post('/upload', upload.single('pdf'), async (req, res) => {
    const { originalname, buffer } = req.file;

    // Save the PDF to MongoDB
    const pdf = new Pdf({
        name: originalname,
        data: buffer,
    });

    await pdf.save();

    res.redirect('/');
});

// Display all uploaded PDFs
app.get('/pdfs', async (req, res) => {
    const pdfs = await Pdf.find();
    res.json(pdfs);
});
// ...

// Display a specific PDF by ID
app.get('/pdf/:id', async (req, res) => {
    const pdfId = req.params.id;

    try {
        const pdf = await Pdf.findById(pdfId);

        if (!pdf) {
            return res.status(404).send('PDF not found');
        }

        res.contentType('application/pdf');
        res.send(pdf.data);
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

// ...


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

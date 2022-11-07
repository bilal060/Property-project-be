require('dotenv').config({ path: '.variables.env' });
const mongoose = require('mongoose');
var fs = require('fs');
const PropertyOwners = mongoose.model('PropertyOwners');
const PropertiesListing = mongoose.model('PropertiesListing');
const XLSX = require("xlsx");
const FileUploadFields = require('@/middlewares/schemeFieldsValidtor');

exports.raedFileData = async (req, res) => {
    try {
        for (let file of req.files) {
            console.log(file.path)
            var workbook = XLSX.readFile(file.path);
            var sheet_name_list = workbook.SheetNames;
            let jsonData = XLSX.utils.sheet_to_json(
                workbook.Sheets[sheet_name_list[0]], { defval: '' }
            );
            if (jsonData.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: "xml sheet has no data",
                });
            }
            // const keys = Object.keys(data);
            // const fileds = ["MembershipNo", "FullName", "CNIC", "TelNO", "CellNo", "MailingAddress", "City", "Rank", "Regt", "PlotSize", "FileNo", "PlotNo", "Phase", "Sector", "SubProject", "RefNo", "SecNo", "CommunityCenter"];
            // var difference = fileds.filter(x => !keys.includes(x));
            const difference = await FileUploadFields(jsonData[0]);
            console.log(difference)
            if (difference.length > 0) {
                return res.status(400).json({
                    success: false,
                    result: [],
                    fields: difference,
                    message: 'invalid file schema',
                });
            }

            if (difference.length > 0) {
                return res.status(500).json({
                    success: false,
                    result: [],
                    fields: difference,
                    message: 'invalid file schema',
                });
            }
            for (let items of jsonData) {
                const result = await PropertyOwners.findOne({ CNIC: items.CNIC })
                const Property = await PropertiesListing.findOne({ PlotNo: items.PlotNo })
                if (result && Property === null) {
                    items.Society = req.params.id
                    items.owner = result._id
                    await new PropertiesListing(items).save();
                } else if (result === null && Property === null) {
                    const result = await new PropertyOwners(items).save();
                    items.Society = req.params.id
                    items.owner = result._id
                    await new PropertiesListing(items).save();
                }
            }
            fs.unlink(file.path, function (err) {
                if (err) throw err;
                console.log('File deleted!');
            });
            return res.status(201).json("jsonData");
        }

    } catch (err) {
        return res.status(500).json({ success: false, message: err.message });
    }
};



exports.getPropertiesBySocietyId = async (req, res) => {
    const { society } = req.query
    const page = req.query.page || 1;
    const limit = parseInt(req.query.items) || 10;
    const skip = page * limit - limit;
    try {

        let query = { removed: false }
        if (society) {
            query.society = society

        }

        const resultsPromise = PropertiesListing.find(query)
            .skip(skip)
            // .limit(limit)
            .sort({ created: 'desc' })
            .populate();
        const countPromise = PropertiesListing.count(query);
        const [result, count] = await Promise.all([resultsPromise, countPromise]);
        const pages = Math.ceil(count / limit);


        const pagination = { page, pages, count };


        if (count > 0) {
            return res.status(200).json({
                success: true,
                result,
                pagination,
                message: 'Successfully found all documents',
            });
        } else {
            return res.status(203).json({
                success: false,
                result: [],
                pagination,
                message: 'Collection is Empty',
            });
        }
    } catch (err) {
        console.log(err)
        return res.status(500).json({
            success: false,
            result: [],
            message: 'Oops there is an Error',
            error: err,
        });
    }
};




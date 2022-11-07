const FileUploadFields = async (data) => {
    const keys = Object.keys(data);
    const fileds = ["MembershipNo", "FullName", "CNIC", "TelNO", "CellNo", "MailingAddress", "City", "Rank", "Regt", "PlotSize", "FileNo", "PlotNo", "Phase", "Sector", "SubProject", "RefNo", "SecNo", "CommunityCenter"];
    var difference = fileds.filter(x => !keys.includes(x));
    console.log(difference)
    return difference
};


module.exports = FileUploadFields
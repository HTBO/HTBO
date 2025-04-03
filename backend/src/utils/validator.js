const mongoose = require('mongoose');

const validateObjectId = async (model, id, res) => {
    const existInModel = await model.findById(id);    
    if (!mongoose.Types.ObjectId.isValid(id) || !existInModel) 
        return res.status(400).json({ error: `Invalid ${model} ${id}` });
    return true;
}


module.exports = validateObjectId;
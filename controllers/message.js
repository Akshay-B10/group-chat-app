exports.sentMsg = async (req, res) => {
    try {
        const msg = req.body.message;
        await req.user.createMessage({
            message: msg
        });
        res.json({
            message: "Success"
        })
    } catch (err) {
        res.status(500).json({
            message: "Error sending message",
            err: err
        })
    }
};
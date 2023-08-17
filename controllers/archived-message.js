const { CronJob } = require("cron");

const ArchivedMessage = require("../models/archived-message");
const Message = require("../models/message");

const { Op } = require("sequelize");

const job = new CronJob("0 0 0 * * *", archiveMessage);
// Every day at 00:00:00. "sec(0-59) min(0-59) hrs(0-23) day(1-31) month(1-12) day(0-6)"

async function archiveMessage() {
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() - 1); // 1 day ago

    const oldMessages = await Message.findAll({
        where: {
            createdAt: {
                [Op.lt]: thresholdDate
            }
        },
    });
    for (const message of oldMessages) {
        await ArchivedMessage.create({
            message: message.message,
            sender: message.sender,
            userId: message.userId,
            groupId: message.groupId
        });

        await message.destroy();
    };
};

job.start();
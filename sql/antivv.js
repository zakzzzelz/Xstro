import { DATABASE } from '#lib';
import { DataTypes } from 'sequelize';

const AntiVV = DATABASE.define('AntiViewOnce', {
    type: {
        type: DataTypes.ENUM('all', 'dm', 'gc'),
        allowNull: false,
        defaultValue: 'all'
    },
    isEnabled: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, { 
    tableName: 'antiviewonce', 
    timestamps: false 
});

async function setViewOnce(status) {
    try {
        const [setting] = await AntiVV.findOrCreate({ where: {} });
        await setting.update({ isEnabled: status });
        return true;
    } catch (error) {
        return false;
    }
}

async function isViewOnceEnabled() {
    try {
        const [setting] = await AntiVV.findOrCreate({ where: {} });
        return setting.isEnabled;
    } catch (error) {
        return false;
    }
}

async function setViewOnceType(type) {
    try {
        const [setting] = await AntiVV.findOrCreate({ where: {} });
        await setting.update({ type });
        return true;
    } catch (error) {
        return false;
    }
}

async function getSettings() {
    try {
        const [setting] = await AntiVV.findOrCreate({ where: {} });
        return setting;
    } catch (error) {
        return { type: 'all', isEnabled: false };
    }
}
export {
    AntiVV,
    setViewOnce,
    isViewOnceEnabled,
    setViewOnceType,
    getSettings
};
import fs from 'fs';
import path from 'path';

const store = path.join('store', 'stickercmd.json');

if (!fs.existsSync(store)) {
  fs.writeFileSync(store, JSON.stringify([], null, 2));
}

const readStickerCmds = () => JSON.parse(fs.readFileSync(store, 'utf8'));
const writeStickerCmds = (cmds) => fs.writeFileSync(store, JSON.stringify(cmds, null, 2));

/**
 * Adds or updates a sticker command.
 * @param {string} cmd - The command name.
 * @param {string} id - The ID associated with the command.
 * @returns {Promise<boolean>} - Returns true after successfully adding or updating.
 */
export async function setcmd(cmd, id) {
  const cmds = readStickerCmds();
  const existingCmd = cmds.find((stickerCmd) => stickerCmd.cmd === cmd);

  if (existingCmd) {
    existingCmd.id = id;
  } else {
    // Add new command
    cmds.push({ cmd, id });
  }

  writeStickerCmds(cmds);
  return true;
}

/**
 * Deletes a sticker command.
 * @param {string} cmd - The command name.
 * @returns {Promise<boolean>} - Returns true if deleted, false if not found.
 */
export async function delcmd(cmd) {
  const cmds = readStickerCmds();
  const index = cmds.findIndex((stickerCmd) => stickerCmd.cmd === cmd);

  if (index === -1) {
    return false;
  }

  cmds.splice(index, 1);
  writeStickerCmds(cmds);
  return true;
}

/**
 * Retrieves all sticker commands.
 * @returns {Promise<Array>} - An array of sticker commands.
 */
export async function getcmd() {
  return readStickerCmds();
}

/**
 * Checks if a sticker command exists by ID.
 * @param {string} id - The ID of the sticker command.
 * @returns {Promise<Object>} - The sticker command object or null if not found.
 */
export async function isStickerCmd(id) {
  const cmds = readStickerCmds();
  const stickerCmd = cmds.find((stickerCmd) => stickerCmd.id === id);

  if (stickerCmd) {
    return {
      exists: true,
      command: {
        cmd: stickerCmd.cmd,
        id: stickerCmd.id,
      },
    };
  }

  return {
    exists: false,
    command: null,
  };
}

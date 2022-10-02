import { BlockPos } from "bdsx/bds/blockpos";
import { ItemStack } from "bdsx/bds/inventory";
import { ServerPlayer } from "bdsx/bds/player";
import { events } from "bdsx/event";
import * as fs from "fs";

export interface crates_data {
    display: string;
    items: ItemStack[];
}

export let config: {
    position: BlockPos|null;
    key_name: string;
    key_item: keyof ItemIdMap;
} = {
    position: null,
    key_name: "{name} &aKey",
    key_item: "minecraft:paper",
};

export let crates: { [name: string]: crates_data } = {};

try { config = require(__dirname + "../../../data/config.json") } catch(e) { console.log("[Custom-Crates] config.json not found!") }
try { crates = require(__dirname + "../../../data/crates.json") } catch(e) { console.log("[Custom-Crates] configrates.json not found!") }

export class CustomCrates {
    /**Create a new Crates. */
    static create(name: string, display?: string, actor?: ServerPlayer): boolean {
        const obj = Object.keys(crates);
        if (crates.hasOwnProperty(name)) {
            actor?.sendMessage(`§c${name}§r§c already!`);
            return false;
        }
        obj.forEach((v) => {
            if (name === crates[v].display) {
                actor?.sendMessage(`§cDisplay already!`);
                return false;
            }
        });
        if (name === "") {
            actor?.sendMessage(`§cInvalid name.`);
            return false;
        }

        crates[name] = {
            display: display ?? name,
            items: [],
        }
        actor?.sendMessage(`§aSuccess to create ${display} crates.`);
        return true;
    }
    /**Delete a Crates. */
    static delete(name: string, actor?: ServerPlayer): boolean {
        if (crates.hasOwnProperty(name) === false) {
            actor?.sendMessage(`§c${name}§r§c not found!`);
            return false;
        }

        delete crates[name];
        actor?.sendMessage(`§aSuccess delete ${name}`);
        return true;
    }
    /**Change/Set display in Crates. */
    static changeDisplay(name: string, display: string, actor?: ServerPlayer): boolean {
        if (crates.hasOwnProperty(name) === false) {
            actor?.sendMessage(`§c${name}§r§c not found!`);
            return false;
        }

        const data = crates[name];

        if (display === "") {
            actor?.sendMessage(`§cInvalid display.`);
            return false;
        }
        if (data.display === display) {
            actor?.sendMessage(`§cDisplay is same.`);
            return false;
        }

        actor?.sendMessage(`§aSuccess change §r${data.display}§r§a to §r${display}`);
        data.display=display;
        return true;
    }
    /**Add item in Crates. */
    static addItem(name: string, item: ItemStack, actor?: ServerPlayer): boolean {
        if (crates.hasOwnProperty(name) === false) {
            actor?.sendMessage(`§c${name}§r§c not found!`);
            return false;
        }
        if (item.isNull()||item.getName() === "minecraft:air") {
            actor?.sendMessage(`§cInvalid item.`);
            return false;
        }

        const data = crates[name];

        data.items.push(item);
        actor?.sendMessage(`§aSuccess added §7[§b${item.getCustomName()}§r§7, §b${item.getAmount()}§7]§a to ${data.display}`);
        return true;
    }
    /**Get items in Crates. */
    static getItem(name: string, actor?: ServerPlayer): ItemStack[] {
        if (crates.hasOwnProperty(name) === false) {
            actor?.sendMessage(`§c${name}§r§c not found!`);
            return [];
        }

        const data = crates[name];

        let str: [string, number][] = [];
        data.items.forEach((v) => {
            str.push([v.getName(), v.getAmount()]);
        });

        actor?.sendMessage(`§6Crates§8: §r${str}`);
        return data.items;
    }
    /**Change/Set item in Crates. */
    static setItem(name: string, index: number, item: ItemStack, actor?: ServerPlayer): boolean {
        if (crates.hasOwnProperty(name) === false) {
            actor?.sendMessage(`§c${name}§r§c not found!`);
            return false;
        }

        const data = crates[name];

        if (index > data.items.length||index < 0) {
            actor?.sendMessage(`§cIndex not found!`);
            return false;
        }

        actor?.sendMessage(`§aSuccess set §7[§b${data.items[index].getCustomName()}§r§7, §b${data.items[index].getAmount()}§7] §ato §7[§b${item.getCustomName()}§r§7, §b${item.getAmount()}§7]`);
        data.items[index] = item;
        return true;
    }
    /**Remove item in Crates. */
    static removeItem(name: string, index: number, actor?: ServerPlayer): boolean {
        if (crates.hasOwnProperty(name) === false) {
            actor?.sendMessage(`§c${name}§r§c not found!`);
            return false;
        }

        const data = crates[name];

        if (index > data.items.length||index < 0) {
            actor?.sendMessage(`§cIndex not found!`);
            return false;
        }

        const item = data.items[index];

        actor?.sendMessage(`§aSuccess remove §7[§b${item.getCustomName()}§r§7, §b${item.getAmount()}§7]`);
        delete data.items[index];
        return true;
    }
    /**WriteConfigFile. */
    static writeConfig(actor?: ServerPlayer): void {
        fs.writeFile(__dirname + "../../../data/config.json", JSON.stringify(config), (err) => {
            if (err) {
                console.log(`[Custom-Crates] config.json Error! \n${err}`);
                actor?.sendMessage(`[Custom-Crates] config.json Error! \n${err}`);
            } else {
                console.log(`[Custom-Crates] config.json Save!`);
                actor?.sendMessage(`[Custom-Crates] config.json Save!`);
            }
        });
    }
    /**WriteCratesFile. */
    static writeCrates(actor?: ServerPlayer): void {
        fs.writeFile(__dirname + "../../../data/crates.json", JSON.stringify(crates), (err) => {
            if (err) {
                console.log(`[Custom-Crates] crates.json Error! \n${err}`);
                actor?.sendMessage(`[Custom-Crates] crates.json Error! \n${err}`);
            } else {
                console.log(`[Custom-Crates] crates.json Save!`);
                actor?.sendMessage(`[Custom-Crates] crates.json Save!`);
            }
        });
    }
    /**WriteAllFiles. */
    static writeFile(actor?: ServerPlayer): void {
        this.writeConfig(actor);
        this.writeCrates(actor);
    }
}

events.serverStop.on(() => { CustomCrates.writeFile() });


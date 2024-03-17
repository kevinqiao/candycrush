
export const getDualBounds = (width: number, height: number, column: number, row: number): { name: string; top: number; left: number; width: number; height: number; radius?: number }[] => {
    const bounds: { name: string; top: number; left: number; width: number; height: number; radius?: number }[] = [];

    const direction = width > height ? 1 : 0;
    if (direction > 0) {
        bounds.push({ name: "console", top: 60, left: width * 0.25, width: width * 0.5, height: height * 0.4 - 10 });

        const ow = Math.floor((0.7 * 0.4 * width) / column);
        const oh = Math.floor((0.7 * 0.6 * height) / row);
        const oradius = Math.min(ow, oh);
        const owidth = oradius * column;
        const oheight = oradius * row;
        const otop = (height - oheight) / 2;
        const oleft = (0.4 * width - owidth) / 2;
        bounds.push({ name: "opponent", top: otop, left: oleft, width: owidth, height: oheight, radius: oradius });

        const pw = Math.floor((0.7 * 0.6 * width) / column);
        const ph = Math.floor((0.7 * (height - 10)) / row);
        const pradius = Math.min(Math.min(pw, ph), 70);
        const pwidth = pradius * column;
        const pheight = pradius * row;
        const ptop = 60 + (height - pheight) / 2;
        const pleft = 0.4 * width + (0.6 * width - pwidth) / 2;
        bounds.push({
            name: "player",
            top: ptop,
            left: pleft,
            width: pwidth,
            height: pheight,
            radius: pradius,
        });

    } else {
        //console: 0.4x0.35   opponent:0.6x0.35 player:1x0.65
        bounds.push({ name: "console", top: 30, left: width * 0.04, width: width * 0.5, height: height * 0.35 - 10 });

        const ow = Math.floor((0.75 * 0.5 * width) / column);
        const oh = Math.floor((0.75 * 0.35 * height) / row);
        const oradius = Math.min(ow, oh);
        const owidth = oradius * column;
        const oheight = oradius * row;
        const otop = (0.35 * height - oheight) / 2;
        const oleft = 0.5 * width + (0.5 * width - owidth) / 2;
        bounds.push({ name: "opponent", top: otop, left: oleft, width: owidth, height: oheight, radius: oradius });

        const pw = Math.floor((0.8 * width) / column);
        const ph = Math.floor((0.9 * 0.65 * height) / row);
        const pradius = Math.min(60, Math.min(pw, ph));
        const pwidth = pradius * column;
        const pheight = pradius * row;
        const ptop = 0.35 * height - 20 + (0.65 * height - pheight) / 2;
        const pleft = (width - pwidth) / 2;
        bounds.push({
            name: "player",
            top: ptop,
            left: pleft,
            width: pwidth,
            height: pheight,
            radius: pradius,
        });

    }
    return bounds;
}

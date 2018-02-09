const mainDocs = require("../../maindocs.json");
const pd = require("pretty-data").pd;
const {
  SVGPathData,
  SVGPathDataTransformer,
  SVGPathDataEncoder,
  SVGPathDataParser
} = require("svg-pathdata");
const { promisify } = require("es6-promisify");
const [parseString, Builder] = [
  promisify(require("xml2js").parseString),
  require("xml2js").Builder
];

const readFile = promisify(require("fs").readFile);

const main = async (args) => {
  process.stdout.write("\x1B[2J\x1B[0f\u001b[0;0H"); // clears the terminal

  let svg = await readFile("./Testing.svg", "utf8");
  svg = pd.xml(svg);
  svg = svg.replace(/(<style>)(.*)(<\/style>)/g, (full, s1, css, s2) => {
    return `${s1}\n${pd.css(css)}\n${s2}`;
  });
  svg = svg.replace(/(<)(.*)(>)/g, (full, head, allData, tail) => {
    allData = allData.split(" ").join("\n");
    allData = allData.replace(/(d=")(.*)(")/g, (full, start, data, end) => {
      let thisData = new SVGPathData(data)["commands"];
      thisData = thisData
        .map((item) => {
          item.type = Object.keys(SVGPathData).find(
            (key) => SVGPathData[key] === item.type
          );
          return `${JSON.stringify(item)}`;
        })
        .join("\n");
      return `${start}${thisData}${end}`;
    });
    return `${head}${allData}${tail}\n`;
  });
  console.log(svg);
};

main();

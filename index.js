const fs = require('fs');
const convert = require('xml-js');
const protobuf = require('protobufjs');

// Charger la définition Protobuf à partir du fichier .proto
const root = protobuf.loadSync('employee.proto');
const EmployeeList = root.lookupType('Employees');

// Création d'une liste d'employés en mémoire
const employees = [
  { id: 1, name: 'Ali', salary: 9000 },
  { id: 2, name: 'Kamal', salary: 22000 },
  { id: 3, name: 'Amal', salary: 23000 }
];

// Objet racine correspondant au message "Employees"
let jsonObject = { employee: employees };

// --- JSON ---
console.time("Encodage JSON");
let jsonData = JSON.stringify(jsonObject);
console.timeEnd("Encodage JSON");

console.time("Décodage JSON");
let parsedJson = JSON.parse(jsonData);
console.timeEnd("Décodage JSON");

// --- XML ---
const options = { compact: true, ignoreComment: true, spaces: 0 };
console.time("Encodage XML");
let xmlData = "<root>\n" + convert.json2xml(jsonObject, options) + "\n</root>";
console.timeEnd("Encodage XML");

// (Pas de vrai décodage XML ici, mais tu pourrais utiliser convert.xml2js)

// --- Protobuf ---
let errMsg = EmployeeList.verify(jsonObject);
if (errMsg) throw Error(errMsg);

console.time("Encodage Protobuf");
let message = EmployeeList.create(jsonObject);
let buffer = EmployeeList.encode(message).finish();
console.timeEnd("Encodage Protobuf");

console.time("Décodage Protobuf");
let decoded = EmployeeList.decode(buffer);
console.timeEnd("Décodage Protobuf");
// ---------- XML : décodage ----------
console.time('XML decode');
// Conversion XML -> JSON (texte) -> objet JS
let xmlJson = convert.xml2json(xmlData, { compact: true });
let xmlDecoded = JSON.parse(xmlJson);
console.timeEnd('XML decode');
// --- Écriture des fichiers ---
fs.writeFileSync('data.json', jsonData);
fs.writeFileSync('data.xml', xmlData);
fs.writeFileSync('data.proto', buffer);

// --- Taille des fichiers ---
const jsonFileSize = fs.statSync('data.json').size;
const xmlFileSize = fs.statSync('data.xml').size;
const protoFileSize = fs.statSync('data.proto').size;

console.log(`Taille de 'data.json' : ${jsonFileSize} octets`);
console.log(`Taille de 'data.xml'  : ${xmlFileSize} octets`);
console.log(`Taille de 'data.proto': ${protoFileSize} octets`);

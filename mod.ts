import { parseArgs } from "jsr:@std/cli@0.216";
import { join } from "jsr:@std/path@0.216/join";

const decoder = new TextDecoder()
const ARGS = parseArgs(Deno.args, {
    string: ["-r", "r"]
})

if (!ARGS.r) throw new Error("Missing -r parameter")

type WeatherData = {
    sunsetDate: string;
    weatherCode: string;
    weatherServiceName: string;
    temperatureÇelsius: number;
    windBearing: number;
    sundriseDate: string;
    conditionsDescription: string;
    preassureMB: number;
    moonPhase: number;
    visibilityKM: number;
    relativeHumidity: number;
    windSpeedKPH: number;
    windChillCelsius: number;
}

type PhotoData = {
    fileSize: number;
    orderInEntry: number;
    creationDevice: string;
    duration: number;
    favorite: boolean;
    type: string;
    identifier: string;
    date: string;
    exporsureBiasValue: number;
    height: number;
    width: number;
    md5: string;
    isSketch: boolean;
}

type LocationData = {
    region: {
        center: {
            latitude: number;
            longitude: number;
        }
        radius: number;
    },
    localityName: string;
    country: string;
    latitude: string;
    longitude: string;
    placeName: string;
    administrativeArea: string;
}

type JournalData = {
    weather?: WeatherData;
    modifiedDate: string;
    starred: boolean;
    creationDevice: string;
    creationOSName: string;
    editingTime: number;
    text: string;
    creationDate: string;
    isPinned: boolean;
    timeZone: string;
    photos: PhotoData[];
    uuid: string;
    creationDeviceType: string;
    duration: number;
    creationOSVersion: string;
    location: LocationData;
    creationDeviceModel: string;
    isAllDay: boolean;
}

const photos: Map<string, PhotoData> = new Map()
const output = "OUTPUT";
const filesProcessed = [];

function template(vals: JournalData) {
    return `
---
device: ${vals.creationDevice}
date: ${vals.creationDate}
country: ${vals.location?.country}
city: ${vals.location?.localityName}
long: ${vals.location?.longitude}
lat: ${vals.location?.latitude}
updated: ${vals.modifiedDate}
timezone: ${vals.timeZone}
---

${parseMedia(vals.text)}
`
}

function parseMedia(data: string) {
    const regex = /\!\[\]\(dayone\-moment\:\/\/(\w+)\)/g
    const results = regex.exec(data);

    if (!results) return data;

    const photo = photos.get(results[1]);
    if (!photo) return data;
    
    const match = results[0];
    const ps = `${join(ARGS.r!, "photos", photo.md5)}.${photo.type}`;
    const pd = `${join(Deno.cwd(), output, 'photos', photo.identifier)}.${photo.type}`; 
    
    Deno.copyFileSync(ps, pd)
    
    return data.replaceAll(match, `![${photo.md5}](${pd})`)
}

function addPhoto(data: PhotoData) {
    photos.set(data.identifier, data);
}

try {
    await Deno.lstat(output)
    await Deno.remove(output, { recursive: true });
    await Deno.mkdir(output);
    await Deno.mkdir(join(output, 'photos'))
} catch(_) {
    await Deno.mkdir(output);
    await Deno.mkdir(join(output, 'photos'))
}

for await (const chunk of Deno.stdin.readable) {
    const data = decoder.decode(chunk);
    const journaldata = JSON.parse(data);

    journaldata.entries.forEach((d: JournalData) => {
        if (d.photos?.length > 0) {
            d.photos.forEach(addPhoto)
        }

        filesProcessed.push(Deno.writeTextFile(`${output}/${d.uuid}.md`, template(d)));
    })
}



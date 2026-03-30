

// Database of Common MAC OUIs (Organizationally Unique Identifiers)
// Focused on Security, CCTV, Networking, and Mobile devices.

const MAC_DB: Record<string, string> = {
    // --- CCTV & SECURITY (Hikvision, Dahua, Axis, Uniview, Bosch, Honeywell, etc.) ---
    '1013EE': 'Hikvision', '4CA64C': 'Hikvision', '80691A': 'Hikvision', 'C85B76': 'Hikvision',
    '88366C': 'Hikvision', 'A41437': 'Hikvision', 'C056E3': 'Hikvision', 'D46A91': 'Hikvision',
    '38AF29': 'Dahua', '9002A9': 'Dahua', '4C11BF': 'Dahua', 'E0508B': 'Dahua',
    '9C1463': 'Dahua', 'B0C554': 'Dahua', '3CFA06': 'Dahua',
    '00408C': 'Axis Communications', 'ACCC8E': 'Axis Communications', 'B8A44F': 'Axis Communications',
    '0002D1': 'Vivotek', '001D56': 'Bosch Security', '000F4B': 'Sony (Camera)',
    '48EA63': 'Uniview (UNV)', '680927': 'Uniview (UNV)', 'D46E0E': 'Uniview (UNV)',
    '00116B': 'Digital Watchdog', '001C62': 'LG Electronics (CCTV)',
    'E8802E': 'Blink (Amazon)', '9C8E99': 'Tuya Smart', 'D4A651': 'Tuya Smart',
    '00626E': 'Reolink', 'BC542F': 'Reolink', 'EC71DB': 'Reolink',
    '0024C4': 'Honeywell', '0010E8': 'Telular (Alarm)', '00045A': 'Honeywell',
    '001761': 'ZKTeco (Access Control)', 'C43875': 'ZKTeco',
    '000B82': 'Grandstream', '000B3D': 'Osmozis',
    '0015B7': 'Toshiba', '0080F0': 'Panasonic',
    '34CE00': 'Tiandy', '005094': 'Pace', '000378': 'ManageEngine',
    '0003C5': 'Geutebruck', '001915': 'Dorlet', '001D9C': 'Risco Group',
    '2034FB': 'Ajax Systems', '508BB4': 'Ajax Systems', '001A1B': 'Salto Systems',
    '00267B': 'Paxton Access', '000429': 'Pixord',
    '000C29': 'VMware', '005056': 'VMware', '00155D': 'Microsoft (Hyper-V)',

    // --- ISPs & ROUTERS (Huawei, ZTE, Sagemcom, Comtrend, AVM, etc.) ---
    '001882': 'Huawei', '00259E': 'Huawei', '00E0FC': 'Huawei', '200BC7': 'Huawei',
    'F84A63': 'Huawei', '80B686': 'Huawei', '04C06F': 'Huawei', '84A8E4': 'Huawei',
    '001E73': 'ZTE', '84742A': 'ZTE', 'C864C7': 'ZTE', 'FC1999': 'ZTE',
    '001970': 'Sagemcom', 'F4CAE5': 'Sagemcom', '1062EB': 'Sagemcom',
    '001D19': 'Comtrend', '00A026': 'Comtrend', 'C8BE19': 'Comtrend',
    '00040E': 'AVM (Fritz!Box)', 'C80E14': 'AVM (Fritz!Box)',
    '002163': 'ASKEY', 'D46A6A': 'ASKEY',
    '001095': 'Technicolor', 'B42A0E': 'Technicolor',
    '001DD5': 'ARRIS', '0024A1': 'ARRIS', '38700C': 'ARRIS',
    '7054F5': 'Sercomm', '000E8F': 'Sercomm',
    '002686': 'Quantenna', '001392': 'Ruckus Wireless',
    '0024A5': 'Buffalo', '001D73': 'Buffalo',
    '000C41': 'Cisco-Linksys', '586D8F': 'Cisco',
    '00904C': 'Epcom', '000B3B': 'Datacom',

    // --- NETWORKING (Ubiquiti, Mikrotik, TP-Link, Netgear, Aruba, Ruijie) ---
    'FCECDA': 'Ubiquiti', 'B4FBE4': 'Ubiquiti', '7483C2': 'Ubiquiti', '44D9E7': 'Ubiquiti',
    '602232': 'Ubiquiti', '788A20': 'Ubiquiti', '18E829': 'Ubiquiti', 'E063DA': 'Ubiquiti',
    '00000C': 'Cisco', '000142': 'Cisco', '000143': 'Cisco', '000163': 'Cisco',
    '000164': 'Cisco', '000196': 'Cisco', '000197': 'Cisco', 'BC1665': 'Cisco Meraki',
    'D4CA6D': 'MikroTik', '4C5E0C': 'MikroTik', '64D154': 'MikroTik', '2C690C': 'MikroTik',
    '14C213': 'TP-Link', '50C7BF': 'TP-Link', '98DED0': 'TP-Link', '7C8BCA': 'TP-Link',
    '000B86': 'Aruba Networks', '204C03': 'Aruba Networks',
    '00146C': 'Netgear', 'A021B7': 'Netgear', '00184D': 'Netgear', '9C3DCF': 'Netgear',
    '00E04C': 'Realtek', '001A2B': 'Realtek',
    '001132': 'Synology', '0014D1': 'Trendnet', '0050C2': 'IEEE (Generic/Qontinuum?)',
    '00749C': 'Ruijie Networks', '105F02': 'Ruijie Networks', '10823D': 'Ruijie Networks',
    '28D0F5': 'Ruijie Networks', '300D9E': 'Ruijie Networks', 'F0748D': 'Ruijie Networks',
    '9CCE88': 'Ruijie Networks',

    // --- COMPUTERS (HP, Dell, Lenovo, Apple, MSI, Asus) ---
    '002481': 'HP', '3CD92B': 'HP', 'FC15B4': 'HP', 'A08CFD': 'HP',
    '3C8C91': 'Dell', '001422': 'Dell', '001143': 'Dell',
    '3C970E': 'Lenovo', '54E1AD': 'Lenovo', '60D819': 'Lenovo', '00237D': 'Lenovo',
    '0016D4': 'Acer', '001C25': 'Acer',
    '001D60': 'ASUS', '04D9F5': 'ASUS', 'F07959': 'ASUS',
    '0019DB': 'Micro-Star (MSI)', 'D8CB8A': 'Micro-Star (MSI)',
    'A1B2C3': 'Intel', '8086': 'Intel Corporate', '00215C': 'Intel',

    // --- MOBILE (Apple, Samsung, Xiaomi, Oppo, Vivo, Motorola) ---
    // Apple (Prefixes are vast, adding common ones)
    '7C87CE': 'Apple', 'F09E4A': 'Apple', 'BC926B': 'Apple', '88665A': 'Apple',
    'F4F951': 'Apple', '1C1A7E': 'Apple', 'ACBC32': 'Apple', 'B8098A': 'Apple',
    'D8D1CB': 'Apple', '000393': 'Apple', '000502': 'Apple', '000A27': 'Apple',
    '000A95': 'Apple', '000D93': 'Apple', '0010FA': 'Apple', '001124': 'Apple',
    '001451': 'Apple', '0016CB': 'Apple', '0017F2': 'Apple', '0019E3': 'Apple',
    '001B63': 'Apple', '001C27': 'Apple', '001D4F': 'Apple', '001E52': 'Apple',
    '001EC2': 'Apple', '001F5B': 'Apple', '001F5C': 'Apple', '0021E9': 'Apple',
    '002241': 'Apple', '002312': 'Apple', '002332': 'Apple', '00236C': 'Apple',
    '0023DF': 'Apple', '002436': 'Apple', '002500': 'Apple', '00254B': 'Apple',
    '0025BC': 'Apple', '002608': 'Apple', '00264A': 'Apple', '0026B0': 'Apple',

    // Samsung
    '30074D': 'Samsung', '24166D': 'Samsung', '000278': 'Samsung', '0007AB': 'Samsung',
    '000918': 'Samsung', '000D0B': 'Samsung', '001247': 'Samsung', '001599': 'Samsung',
    'FC0012': 'Samsung', 'BC20A4': 'Samsung',

    // Others
    '50EC50': 'Xiaomi', '64B5C6': 'Nintendo', '9C2EA1': 'Xiaomi', 'ACF7F3': 'Xiaomi',
    'A09347': 'Oppo', '4C1836': 'Oppo',
    '980033': 'Vivo',
    '0021D2': 'Motorola', 'F4F524': 'Motorola',
    '00111C': 'HTC',
    '3C22FB': 'OnePlus',

    // --- TV & MEDIA (LG, Sony, Hisense, TCL, Roku) ---
    '00AA00': 'Intel (LG TV)', '0005CD': 'Denon',
    '0009B0': 'Onkyo', '702C1F': 'Vizio', '0025E5': 'Vizio',
    'D43A2C': 'TCL', '001240': 'Hisense',
    'CC6E99': 'Roku', 'B0A737': 'Roku',
    '747548': 'Amazon (Fire TV)', 'F0D2F1': 'Amazon (Echo)',
    'F4F5E8': 'Google (Chromecast)', 'D8EB46': 'Google (Home)',

    // --- IOT & HOME AUTOMATION (Espressif, Shelly, Sonoff, Tuya, Philips) ---
    '246F28': 'Espressif (Generic IoT)', 'CC50E3': 'Espressif (Generic IoT)', '84F3EB': 'Espressif (Generic IoT)',
    '5CFA26': 'Espressif (Sonoff/Shelly)', '483FDA': 'Espressif (Sonoff/Shelly)',
    '84CCA8': 'Shelly (Allterco)', '349454': 'Shelly',
    '001788': 'Philips Lighting (Hue)',
    '04CF8C': 'Yeelight (Xiaomi)',
    '500291': 'Nest Labs', '18B430': 'Nest Labs',
    '2CAA8E': 'Wyze Labs',
    '00166C': 'Samsung (SmartThings)',

    // --- OTHERS ---
    'B827EB': 'Raspberry Pi', 'DCA632': 'Raspberry Pi', 'E45F01': 'Raspberry Pi',
    '000000': 'Xerox',
    '00409D': 'Digi International',
};

// Function to update the DB at runtime (merged from external source)
export const mergeVendorData = (newVendors: Record<string, string>) => {
    Object.assign(MAC_DB, newVendors);
};

export const getVendor = (mac: string): string => {
    // 1. Clean the MAC (remove colons, dashes, dots, spaces)
    const cleanMac = mac.replace(/[:\-\.\s]/g, '').toUpperCase();

    // 2. Validate length
    if (cleanMac.length < 6) return 'Invalid MAC';

    // 3. Get OUI (First 6 chars)
    const oui = cleanMac.substring(0, 6);

    // 4. Lookup
    if (MAC_DB[oui]) {
        return MAC_DB[oui];
    }

    // 5. Check for Espressif variants if generic
    // Espressif chips are used by 1000s of cheap IoT brands (Sonoff, Tuya, generic bulbs)
    if (['246F28', 'CC50E3', '84F3EB', '5CFA26'].includes(oui)) {
        return 'Espressif (IoT Device)';
    }

    return 'Unknown';
};

export const SUPER_ADMIN_ID = 1
export const SUPER_ADMIN_ROLE_ID = 1
export const PAGE_NO_PERMISSION_MSG = "You have no permission for this page"

export const PRIVILEGE_CATEGORY_CUSTOMER_ADMIN = 'Customer Administration';

export const ERRLVL_WARNING               = "WARN"
export const ERRLVL_ERROR                 = "ERROR"

export const NoPermissionAlertInteral = 2000
export const PERMISSION_TYPE_DENY     = "DENY"
export const PERMISSION_TYPE_ALL      = "PERMITALL"
export const PERMISSION_TYPE_READONLY = "READONLY"

export const ALL_FILTER_VALUE = undefined

export enum TMSUserType {
  superAdmin = 'super_admin',
  administrator = 'administrator',
  normalUser = 'normal_user'
}

export const PAGES = {
  NSR: 'Number Search & Reserve',
  NQU: 'Number Query & Update',

  MNQ: 'Multi Dial Number Query',
  MND: 'Multi Dial Number Disconnect',
  MNS: 'Multi Dial Number Spare',
  TRQ: 'Trouble Referral Number Query'
}

export const ROWS_PER_PAGE_OPTIONS = [
  {name: '10', value: 10},
  {name: '25', value: 25},
  {name: '50', value: 50}
]

export const rowsPerPageOptions = [10, 25, 50, 100]

//Contact Information Modal
//Contact name for the TFN that is being reserved.
export const CONTACT_NAME_REG_EXP        = /^[\w\d\s`'!@#$%&*()-_+={}\[\]\:;<>,.?/.]{1,30}$/
//Contact number for the TFN that is being reserved.
export const CONTACT_NUMBER_REG_EXP      = /^[0-9a-zA-Z]{10}$/

//Number Search

export const OCA_NUM_TYPE_RANDOM = "RANDOM"
export const OCA_NUM_TYPE_SPECIFIC = "SPECIFIC"
export const OCA_NUM_TYPE_WILDCARD = "WILDCARD"

export const WILDCARDNUM_REG_EXP  = RegExp('^(8(00|33|44|55|66|77|88|0(&|\\*)|(&|\\*)0|3(&|\\*)|(&|\\*)3|4(&|\\*)|(&|\\*)4|5(&|\\*)|(&|\\*)5|6(&|\\*)|(&|\\*)6|7(&|\\*)|(&|\\*)7|8(&|\\*)|(&|\\*)8|(&|\\*)(&|\\*)))((\\d|&|\\*|[A-Z]|[a-z]){7}|\\-(\\d|&|\\*|[A-Z]|[a-z]){3}\\-(\\d|&|\\*|[A-Z]|[a-z]){4})$')
export const TFNPA_WILDCAD_REG_EXP= RegExp('^(8(00|33|44|55|66|77|88|0(&|\\*)|(&|\\*)0|3(&|\\*)|(&|\\*)3|4(&|\\*)|(&|\\*)4|5(&|\\*)|(&|\\*)5|6(&|\\*)|(&|\\*)6|7(&|\\*)|(&|\\*)7|8(&|\\*)|(&|\\*)8|(&|\\*)(&|\\*)))')
export const SPECIFICNUM_REG_EXP  = RegExp('^(800|833|844|855|866|877|888)((\\d|[A-Z]|[a-z]){7}|\\-(\\d|[A-Z]|[a-z]){3}\\-(\\d|[A-Z]|[a-z]){4})$')
export const SVC_ORDR_NUM_REG_EXP = RegExp('^([a-z]|[A-Z]){1}(\\d|[a-z]|[A-Z]){3,12}(([a-z]|[A-Z]){1})?$')
export const TIME_REG_EXP         = RegExp('^(0?[0-9]|1[0-2]):(00|15|30|45)\\ (a|A|p|P)(m|M)$')
export const RESPORG_REG_EXP      = /[A-Z]{3}[0-9]{2}$/
export const TFNUM_REG_EXP        = RegExp('^(800|833|844|855|866|877|888)(\\d{7}|\\-\\d{3}\\-\\d{4})$')
export const PHONE_NUMBER_WITH_HYPHEN_REG_EXP = RegExp('\\d{10}|\\d{3}\\-\\d{3}\\-\\d{4}$')
export const LIMIT_SIXTY_LETTERS_REG_EXP = /^[\w\d\s`'!@#$%&*()-_+={}\[\]\:;<>,.?/.]{1,60}$/;
export const TEMPLATE_NAME_REG_EXP        = /^[*][a-zA-Z0-9]{2}[a-zA-Z0-9-]{1,12}$/;
export const EMAIL_REG_EXP        = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export const INVALID_NUM_TYPE_NONE        = 0
export const INVALID_NUM_TYPE_COMMON      = 1
export const INVALID_NUM_TYPE_NPA         = 2
export const INVALID_NUM_TYPE_AMP         = 3
export const INVALID_NUM_TYPE_CONS        = 4
export const INVALID_NUM_TYPE_WILDCARD    = 5
export const INVALID_NUM_TYPE_TOO_MANY    = 6
export const INVALID_NUM_TYPE_EMPTY       = 7

export const NUS_SUBMIT_TYPE_SEARCH		= "SEARCH"
export const NUS_SUBMIT_TYPE_RESERVE		= "RESERVE"
export const NUS_SUBMIT_TYPE_SRCHRES		= "SEARCH & RESERVE"

export const RETRIEVE_CARD_TITLE_PREFIX   = "Retrieve"
export const RESULT_CARD_TITLE_PREFIX2    = "Result: Effective Date, Time and Status: "

//Multiple Conversion to Pointer Records
export const TMPL_ERR_TYPE = {
  NONE: 'none',
  BLANK: 'blank',
  ERROR: 'error'
}

//Auto Reserve Numbers
export const INVALID_TIME_NONE            = 0
export const INVALID_TIME_PAST            = 1
export const INVALID_TIME_ORDER           = 2

export const MAX_REQUESTS_AT_A_TIME_LIMIT = 100

//Number Query and Update
export const INVALID_NUM_TYPE_TENDIGIT = 1
export const NUM_REG_EXP          = RegExp('^(\\d{10}|\\d{3}\\-\\d{3}\\-\\d{4})$')
export const TFNUM_STATE_TRANSITIONAL     = "TRANSITIONAL"
export const TFNUM_STATE_RESERVED         = "RESERVED"
export const TFNUM_STATE_SPARE            = "SPARE"

//Customer Record Admin Data
export const ACTION_NONE                  = "NONE"        // there is no action
export const ACTION_ALL                   = "ALL"        // there is on all action
export const ACTION_CREATE                = "CREATE"      // current is on create action
export const ACTION_UPDATE                = "UPDATE"      // current is on update action
export const ACTION_COPY                  = "COPY"        // current is on copy action
export const ACTION_TRANSFER              = "TRANSFER"    // current is on transfer action
export const ACTION_DISCONNECT            = "DISCONNECT"  // current is on disconnect action
export const ACTION_DELETE                = "DELETE"      // current is on delete action

export const TRANSFER_PENDING_MSG         = "Transfer is Pending and you must submit or save the record to complete Transfer Action"
export const COPY_PENDING_MSG             = "Copy is Pending and you must submit or save the record to complete Copy Action"
export const DISCONNECT_PENDING_MSG       = "Disconnect is Pending and you must submit or save the record to complete Disconnect Action"

export const COPYACTION_CHANGE            = "CHANGE"
export const COPYACTION_CONVERT           = "CONVERT"
export const COPYACTION_DISCONNECT        = "DISCONNECT"
export const COPYACTION_NEW               = "NEW"

export const STAT_SAVED                   = "SAVED"
export const STAT_PENDING                 = "PENDING"
export const STAT_SENDING                 = "SENDING"
export const STAT_ACTIVE                  = "ACTIVE"
export const STAT_OLD                     = "OLD"
export const STAT_INVALID                 = "INVALID"
export const STAT_DISCONNECT              = "DISCONNECT"
export const STAT_MUSTCHECK               = "MUST CHECK"
export const STAT_FAILED                  = "FAILED"

export const AOS_NETWORK_MODAL_HEADER_TITLE  = "Areas of Service: Networks"
export const AOS_STATE_MODAL_HEADER_TITLE    = "Areas of Service: States"
export const AOS_LATA_MODAL_HEADER_TITLE     = "Areas of Service: LATAs"
export const IAC_MODAL_HEADER_TITLE          = "Carriers: IntraLATACarriers"
export const IEC_MODAL_HEADER_TITLE          = "Carriers: InterLATACarriers"


export const RECORD_PAGE_ACTION_CREATE    = "C"
export const RECORD_PAGE_ACTION_RETRIEVE  = "R"

export const RESULT_CARD_TITLE_PREFIX1    = "Result"

export const CPR_SECT_NAME_SET_BUTTON        = "Set"
export const CPR_SECT_NAME_ADD_BUTTON        = "Add"

export const INVALID_ROW = -1;
export const INVALID_COL = -1;

export const LBL_TYPE_AC   = "AC"; // Area Code
export const LBL_TYPE_DT   = "DT"; // Date
export const LBL_TYPE_LT   = "LT"; // LATA
export const LBL_TYPE_NX   = "NX"; // NXX
export const LBL_TYPE_ST   = "ST"; // State
export const LBL_TYPE_TE   = "TE"; // Tel#
export const LBL_TYPE_TI   = "TI"; // Time
export const LBL_TYPE_TD   = "TD"; // 10-digit#
export const LBL_TYPE_SD   = "SD"; // 6-digit#
export const LBL_TYPE_DA   = "DA"; // Day
export const LBL_TYPE_SW   = "SW"; // Switch
export const LBL_TYPE_PC   = "PC"; // Percent
export const LBL_TYPE_CA   = "CA"; // Carrier
export const LBL_TYPE_AN   = "AN"; // Announcement
export const LBL_TYPE_GT   = "GT"; // Go to

export const INIT_LAD_GRID_LENGTH = 12;
export const INIT_CPR_GRID_LENGTH = 7;
export const INIT_NUM_GRID_LENGTH = 10;
export const NUM_GRID_COL_LENGTH = 10;

export const US_CT_TIMEZONE               = "America/Chicago"

export const NUM_NO_PERMISSION_ERR_CODE   = "505002"
export const TAD_NO_PERMISSION_ERR_CODE   = "540002"

export const SAVE_CMD_SIGN    = 'S'   // the save value of the cmd parameter for calling api
export const SUBMIT_CMD_SIGN  = 'U'   // the submit value of the cmd parameter for calling api

export const DEFAULT_CARRIERS = [
  "ATX-0288", "IRK-2121", "LGT-0432"
]

export const CAD_RETRIEVE_SUCCESSFUL         = "CAD retrieved successfully!"
export const CAD_CREATE_SUCCESSFUL           = "CAD created successfully!"
export const CAD_UPDATE_SUCCESSFUL           = "CAD updated successfully!"
export const CAD_COPY_SUCCESSFUL             = "CAD copied successfully!"
export const CAD_TRANSFER_SUCCESSFUL         = "CAD transferred successfully!"
export const CAD_DISCONNECT_SUCCESSFUL       = "CAD disconnected successfully!"
export const CAD_DELETE_SUCCESSFUL           = "CAD deleted successfully!"

export const AOS_NETWORK_LIST = [
  "US Only (US)",
  "Canada (CN)",
  "Carribbean (CR)",
  "US & Canada (XA)",
  "US & Caribbean (XB)",
  "US, Canada & Caribbean (XC)",
  "RGN (BX)",
  "RGN (EU)",
  "RGN (KL)",
  "RGN (RL)",
  "RGN (SB)",
  "RGN (SP)",
  "RGN (UT)",
  "RGN (VQ)",
  "RGN (YK)",
  "AM (AM)",
  "NX (NX)",
  "BA (BA)",
  "BS (BS)",
  "SH (SH)",
  "SN (SN)"
]


export const AOS_STATE_LIST = [
  "Alberta (AB)",
  "Alaska (AK)",
  "Alabama (AL)",
  "Arkansas (AR)",
  "Arizona (AZ)",
  "British Columbia (BC)",
  "California (CA)",
  "Colorado (CO)",
  "Connecticut (CT)",
  "District of Columbia (DC)",
  "Delaware (DE)",
  "Florida (FL)",
  "Georgia (GA)",
  "Hawaii (HI)",
  "Iowa (IA)",
  "Idaho (ID)",
  "Illinois (IL)",
  "Indiana (IN)",
  "Kansas (KS)",
  "Kentucky (KY)",
  "Louisiana (LA)",
  "Massachusetts (MA)",
  "Manitoba (MB)",
  "Maryland (MD)",
  "Maine (ME)",
  "Michigan (MI)",
  "Minnesota (MN)",
  "Missouri (MO)",
  "Mississippi (MS)",
  "Montana (MT)",
  "New Brunswick (NB)",
  "North Carolina (NC)",
  "North Dakota (ND)",
  "Nebraska (NE)",
  "Newfoundland (NF)",
  "New Hampshire (NH)",
  "New Jersey (NJ)",
  "New Mexico (NM)",
  "Nova Scotia (NS)",
  "Northwest Territory (NT)",
  "Nevada (NV)",
  "New York (NY)",
  "Ohio (OH)",
  "Oklahoma (OK)",
  "Ontario (ON)",
  "Oregon (OR)",
  "Pennsylvania (PA)",
  "Province du Quebec (PQ)",
  "Puerto Rico (PR)",
  "Rhode Island (RI)",
  "South Carolina (SC)",
  "South Dakota (SD)",
  "Saskatchewan (SK)",
  "Tennessee (TN)",
  "Texas (TX)",
  "Utah (UT)",
  "Virginia (VA)",
  "Vermont (VT)",
  "Washington (WA)",
  "Wisconsin (WI)",
  "West Virginia (WV)",
  "Wyoming (WY)"
]

export const AOS_NPA_LIST = [
  "403,587,670,671,684,780,825",
  "907",
  "018,205,251,256,334,659,938",
  "479,501,870",
  "480,520,602,623,928",
  "236,250,604,672,778",
  "209,213,279,310,323,341,408,415,424,442,510,530,559,562,619,626,628,650,657,661,669,707,714,747,760,764,805,818,820,831,840,858,909,916,925,949,951",
  "303,719,720,970",
  "203,475,860,959",
  "116,202",
  "105,302",
  "003,009,016,239,305,321,352,386,407,561,689,727,754,772,786,813,850,863,904,941,954",
  "012,013,229,404,470,478,678,706,762,770,912",
  "808",
  "319,515,563,641,712",
  "208,986",
  "217,224,309,312,331,618,630,708,773,779,815,847,872",
  "219,260,317,463,574,765,812,930,999",
  "316,620,785,913",
  "002,270,364,502,606,859",
  "119,225,318,337,504,985",
  "339,351,413,508,617,774,781,857,978",
  "204,431",
  "118,240,301,410,443,667",
  "207",
  "231,248,269,313,517,586,616,734,810,906,947,989",
  "218,320,507,612,651,763,952",
  "314,417,557,573,636,660,816",
  "117,228,601,602,769",
  "406",
  "506",
  "112,113,252,336,704,743,828,910,919,980",
  "701",
  "308,402,531",
  "709",
  "603,700",
  "014,019,102,201,551,609,640,732,848,856,862,908,973",
  "505,575",
  "782,902",
  "867",
  "702,725,775",
  "212,315,332,347,516,518,585,607,631,646,680,716,718,838,845,914,917,929,934",
  "216,220,234,283,326,330,380,419,440,513,567,614,740,937",
  "405,539,580,918",
  "226,249,289,343,365,416,437,519,548,613,647,705,807,905",
  "458,503,541,971",
  "017,106,108,109,215,223,267,272,412,445,484,570,610,717,724,814,835,878",
  "367,418,438,450,514,579,581,819,873",
  "242,246,264,268,284,340,345,441,473,649,658,664,721,758,767,784,787,809,829,849,868,869,876,939",
  "401",
  "111,803,839,843,854,864",
  "605",
  "306,639",
  "114,423,615,629,731,865,901,931",
  "210,214,254,281,325,346,361,409,430,432,469,512,682,713,726,737,806,817,830,832,903,915,936,940,956,972,979",
  "385,435,801",
  "104,107,276,434,540,571,703,757,804",
  "802",
  "206,253,360,425,509,564",
  "262,414,534,608,715,920",
  "008,304,681",
  "307"
]

export const AOS_LATA = "120,122,124,126,128,130,132,133,134,136,138,140,220,222,224,226,228,230,232,234,236,238,240,242,244,246,248,250,252,254,256,320,322,324,325,326,328,330,332,334,336,338,340,342,344,346,348,350,352,354,356,358,360,362,364,366,368,370,374,376,420,422,424,426,428,430,432,434,436,438,440,442,444,446,448,450,452,454,456,458,460,462,464,466,468,470,472,474,476,477,478,480,482,484,486,488,490,492,520,521,522,524,526,528,530,532,534,536,538,540,542,544,546,548,550,552,554,556,558,560,562,564,566,568,570,620,624,626,628,630,632,634,635,636,638,640,644,646,648,650,652,654,656,658,660,664,666,668,670,672,674,676,720,721,722,724,726,728,730,732,734,736,738,740,820,822,824,826,828,830,832,834,836,840,842,844,846,848,850,851,852,854,856,858,860,862,870,871,881,882,883,884,885,886,887,888,889,890,891,892"

export const CARRIER_LIST = [
  "AAM-0866",
  "ABN-0302",
  "ADX-0414",
  "ALG-0241",
  "ALN-0044",
  "ALN-0066",
  "ALN-0444",
  "ALN-0539",
  "ALU-0006",
  "AMJ-0470",
  "AMM-0937",
  "AMN-0366",
  "AMU-0224",
  "ANN-0663",
  "ANW-0053",
  "ANW-0311",
  "ASI-0322",
  "ASI-0400",
  "ASN-0279",
  "ATC-0282",
  "ATE-0050",
  "ATX-0288",
  "ATX-0387",
  "ATX-0732",
  "ATZ-0004",
  "AUC-0966",
  "AUI-5353",
  "AVD-0260",
  "AVZ-0633",
  "AWE-0143",
  "AZC-0061",
  "AZU-0239",
  "BAX-6963",
  "BIZ-0606",
  "BMJ-0499",
  "BML-0742",
  "BNF-6369",
  "BTL-0867",
  "BUC-0368",
  "BUR-0515",
  "CAL-0550",
  "CAO-0670",
  "CDD-0741",
  "CDN-0725",
  "CDX-0662",
  "CDZ-0043",
  "CGI-0885",
  "CGP-0690",
  "CGY-0828",
  "CGZ-5078",
  "CHR-0343",
  "CIN-0891",
  "CIZ-0063",
  "CNK-0881",
  "CNO-0523",
  "COE-0900",
  "COK-0421",
  "COS-0661",
  "CPD-0410",
  "CPL-0221",
  "CPL-0723",
  "CPL-0963",
  "CPW-0073",
  "CQO-0319",
  "CRV-0351",
  "CTQ-0203",
  "CUT-0268",
  "CWI-0839",
  "CWK-0035",
  "CWL-0566",
  "CWV-0909",
  "CZZ-0586",
  "DES-0147",
  "DEY-0079",
  "DIP-1954",
  "DKC-0361",
  "DLT-0233",
  "DLX-0693",
  "DPY-0082",
  "DTR-0543",
  "DVT-0123",
  "EAS-0136",
  "ECR-0325",
  "EMI-0365",
  "ENW-0202",
  "ESB-0078",
  "ESI-0194",
  "ETM-0048",
  "EXF-0393",
  "EXL-0752",
  "EXP-0865",
  "FFM-0841",
  "FTC-0456",
  "GCN-0077",
  "GFS-0295",
  "GLD-0059",
  "GNM-0997",
  "GSP-0777",
  "GSR-0189",
  "HOG-0965",
  "HPL-0722",
  "IAN-0509",
  "IAS-0225",
  "IAS-6225",
  "IDS-6437",
  "IDW-0460",
  "IEX-0508",
  "IFA-0172",
  "IIC-6406",
  "IOZ-0331",
  "IPC-0589",
  "IPV-0127",
  "IPV-0582",
  "IRK-2121",
  "IUT-0468",
  "IUT-0478",
  "IUT-0897",
  "JJJ-0012",
  "JNT-0568",
  "JRL-0021",
  "KRB-0989",
  "KST-0545",
  "KYL-0699",
  "LCZ-0562",
  "LDB-0477",
  "LDD-0408",
  "LDL-0535",
  "LDM-0536",
  "LDW-0537",
  "LGD-0533",
  "LGK-0708",
  "LGM-0382",
  "LGT-0432",
  "LGT-0665",
  "LMI-0631",
  "LNH-0516",
  "LNK-0563",
  "LOC-6106",
  "LOM-0369",
  "LSI-0036",
  "LSP-0293",
  "LST-0205",
  "LTD-0525",
  "LTL-0253",
  "LTS-0213",
  "MAD-0086",
  "MAL-0801",
  "MCG-0888",
  "MCI-0022",
  "MCI-0222",
  "MCI-0986",
  "MCJ-0088",
  "MCK-0898",
  "MEN-0264",
  "MFZ-0440",
  "MIT-0338",
  "MIT-0996",
  "MJD-0571",
  "MMN-0932",
  "MTV-6388",
  "MWT-0902",
  "MXT-0780",
  "MZL-0818",
  "NAC-0933",
  "NBR-0448",
  "NCQ-0908",
  "NCS-0684",
  "NFL-0657",
  "NFN-0423",
  "NHC-0890",
  "NLE-0746",
  "NNC-0652",
  "NNL-0401",
  "NOE-0135",
  "NPU-0764",
  "NRD-0332",
  "NTG-0806",
  "NTH-0098",
  "NTS-0687",
  "NTT-0231",
  "NTX-0070",
  "NWD-0713",
  "NWN-0831",
  "NWT-0638",
  "NYC-0698",
  "NZT-0697",
  "OAN-0625",
  "OCO-0590",
  "ONE-0226",
  "ONR-0658",
  "OTC-0110",
  "OTX-0110",
  "OWS-0913",
  "PAC-0757",
  "PAC-0758",
  "PAY-0917",
  "PCR-0775",
  "PEN-0412",
  "PHT-0838",
  "PHX-0451",
  "PIO-0728",
  "PJC-0272",
  "PLG-0930",
  "PLS-0767",
  "PMG-0249",
  "PRO-0390",
  "PSA-0045",
  "PUR-5536",
  "PUR-5674",
  "PXP-7882",
  "RNX-5543",
  "RTC-0003",
  "RTC-0211",
  "SBD-0385",
  "SBX-0188",
  "SCH-0500",
  "SDY-0707",
  "SEP-0358",
  "SGY-0795",
  "SJE-0744",
  "SLS-0321",
  "SNC-0999",
  "SNH-0784",
  "SNT-0087",
  "SNT-0852",
  "SNZ-0807",
  "SOR-0323",
  "SPA-0056",
  "SRN-0348",
  "SRN-0507",
  "STE-0782",
  "STJ-0394",
  "STT-0787",
  "STV-0983",
  "STZ-0719",
  "SUC-0993",
  "SUL-0247",
  "SUR-0232",
  "SVL-0880",
  "TAM-0007",
  "TAX-0522",
  "TDD-0220",
  "TDD-0832",
  "TDD-0835",
  "TDD-0857",
  "TDG-0457",
  "TDT-0245",
  "TDX-0223",
  "TEC-0899",
  "TED-0040",
  "TEI-0482",
  "TEM-0771",
  "TFB-0008",
  "TFC-0547",
  "TGN-0458",
  "TGN-0689",
  "TGN-0887",
  "TGR-0846",
  "THB-6444",
  "TIO-0848",
  "TLX-0462",
  "TMN-0826",
  "TOA-0797",
  "TOM-0910",
  "TON-0876",
  "TOR-0290",
  "TPM-0303",
  "TQW-5119",
  "TSH-0330",
  "TTH-0915",
  "TTQ-0461",
  "TUC-0560",
  "TUG-5431",
  "TUH-0751",
  "TUT-0485",
  "TXZ-0269",
  "TYL-0214",
  "TZC-0731",
  "UCN-0858",
  "UCN-0869",
  "UHC-5231",
  "ULD-0556",
  "ULM-0822",
  "URC-0595",
  "USY-0861",
  "UTA-0650",
  "UTC-0033",
  "UTC-0333",
  "UTC-0926",
  "UTT-0855",
  "UYT-0950",
  "VAC-0817",
  "VIN-0446",
  "VNS-0452",
  "VOX-7337",
  "VRT-0811",
  "VSJ-0889",
  "VTD-0010",
  "VWF-0030",
  "WCA-5102",
  "WCA-5158",
  "WCU-0052",
  "WCU-0569",
  "WDC-0953",
  "WES-0085",
  "WES-0090",
  "WIN-0946",
  "WSD-0978",
  "WSN-0071",
  "WTL-0055",
  "WTL-0464",
  "WTL-0555",
  "WUT-0375",
  "WUT-0988",
  "WXL-0781",
  "XTL-0924",
  "XZP-0756"
]

export const TASK_FILTER_FILEDS = [
  'type',
  'action',
  'src_num',
  'src_tmpl_name',
  'email',
  'src_eff_dt_tm',
  'tgt_num',
  'tgt_tmpl_name',
  'tgt_eff_dt_tm',
  'resp_org',
  'status'
]

export const CPR_GRID_CATEGORY_OPTIONS = [
  {name: '<select>', value: ''},
  {name: 'Time', value: 'time'},
  {name: 'Date', value: 'date'},
  {name: 'Tel#', value: 'termNum'},
  {name: 'Day', value: 'dayOfWeek'},
  {name: 'LATA', value: 'lata'},
  {name: 'State', value: 'state'},
  {name: 'Area Code', value: 'areaCode'},
  {name: 'NXX', value: 'nxx'},
  {name: 'Switch', value: 'switch'},
  {name: 'Percent', value: 'pctAlloc'},
  {name: 'Carrier', value: 'carrier'},
  {name: 'Announcement', value: 'announcement'},
  {name: '6-digit#', value: 'sixDigit'},
  {name: '10-digit#', value: 'tenDigit'},
  {name: 'Go to', value: 'goto'},
]

//Pointer Admin Data
export const PAD_RETRIEVE_SUCCESSFUL         = "PAD retrieved successfully!"
export const PAD_CREATE_SUCCESSFUL           = "PAD created successfully!"
export const PAD_UPDATE_SUCCESSFUL           = "PAD updated successfully!"
export const PAD_COPY_SUCCESSFUL             = "PAD copied successfully!"
export const PAD_TRANSFER_SUCCESSFUL         = "PAD transferred successfully!"
export const PAD_DISCONNECT_SUCCESSFUL       = "PAD disconnected successfully!"
export const PAD_DELETE_SUCCESSFUL           = "PAD deleted successfully!"

//Template Admin Data
export const RO_CHANGE_MONITOR_INTERVAL = 500

export const TMPLNAME_REG_EXP     = RegExp('^\\*[A-Z]{2}([A-Z|0-9|\\-|#])+$')
export const TAD_RETRIEVE_SUCCESSFUL         = "TAD retrieved successfully!"
export const TAD_CREATE_SUCCESSFUL           = "TAD created successfully!"
export const TAD_UPDATE_SUCCESSFUL           = "TAD updated successfully!"
export const TAD_COPY_SUCCESSFUL             = "TAD copied successfully!"
export const TAD_TRANSFER_SUCCESSFUL         = "TAD transferred successfully!"
export const TAD_DISCONNECT_SUCCESSFUL       = "TAD disconnected successfully!"
export const TAD_DELETE_SUCCESSFUL           = "TAD deleted successfully!"

export const CADTOTADTYPE_NEW             = "NEW"
export const CADTOTADTYPE_EXIST           = "EXIST"

export const CADTOTADTYPE_COOKIE_NAME     = "cadToTadType"
export const CADTOTADSTATE_COOKIE_NAME    = "state"

//Template Record List
export const ENTITY_LIST = [ "AK", "EJ", "TT", "XQ", "ZX" ];

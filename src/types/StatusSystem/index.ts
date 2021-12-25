export type StatusSystem = {
    "system_platform": string,
    "system_serial": string,
    "system_netgate_id": string,
    "bios_vendor": string,
    "bios_version": string,
    "bios_date": Date,
    "cpu_model": string,
    "kernel_pti": false,
    "mds_mitigation": string,
    "temp_c": number,
    "temp_f": number,
    "load_avg": number[],
    "mbuf_usage": number,
    "mem_usage": number,
    "swap_usage": number,
    "disk_usage": number
}

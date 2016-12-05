/*
http://jodies.de/ipcalc?host=192.168.0.1&mask1=24&mask2=
http://searchnetworking.techtarget.com/tip/How-to-subnet-Subnetting-calculations-and-shortcuts
*/

/* 
	################################
		Helper functions
	################################
*/   

function blank_element(domElement){
	domElement.value="";
}

function _dbg(msg){
	dbg = document.getElementById("debug");
	dbg.innerHTML = msg;
	dbg.innerHTML += "<br/>";
}


/* 
 * Handles forms' onChange() event.
 */
function trigger(){	
	_in = document.getElementById("subnet");
	_ip = document.getElementById("ip_addr")
	_dbg("");
	
	var subn = new IPv4Subnet(_in.value);
		
	if (subn.is_valid_format() && IPv4Subnet.is_valid_address(_ip.value)){
		
		/*
		var bin_str = subn.get_binary_addr(false);
		console.log("Binary address: "+bin_str);
		
		var bin_nm = subn.get_binary_netm();		
		console.log("Binary netmask: "+bin_nm+", "+IPv4Subnet.bin2dot_decimal(bin_nm));
		
		var bin_broadcast = subn.get_binary_broadcast();
		var broadcast = subn.get_broadcast();		
		console.log("Binary broadcast: "+bin_broadcast+", Broadcast IP: " + broadcast );
		
		var minhost = subn.get_binary_minhost();
		var maxhost = subn.get_binary_maxhost();
		console.log("maxhost: " + maxhost + ", IP: " + subn.get_maxhost());
		console.log("minhost: " + minhost + ", IP: " + subn.get_minhost());
		*/
		var isIn = subn.within(_ip.value);
		console.log("IP in given subnet: " + isIn.toString());
		
	}
	
}

/* 
 * A class that parses and manipulates IPv4 dotted-decimal notation
 * subnet definitions.
 */ 
class IPv4Subnet { 
	
	constructor(subnet_def){
		this.input = subnet_def;
	}
	
	/*
	 * TODO: comment :-)
	 */
	within(ip_addr){
		var ip_addr_bin = "";
		
		if (IPv4Subnet.is_valid_address(ip_addr)){
			var octets = IPv4Subnet.get_octets(ip_addr);
			
			for(var i=0; i<octets.length; i++){
				ip_addr_bin += IPv4Subnet.dec2bin(octets[i],8);
			}				
		}
		
		if (this.get_binary_minhost() <= ip_addr_bin && ip_addr_bin <= this.get_binary_maxhost()){
			return true;
		}
		
		return false;
	}
	
	/*
	 * Returns the address of the last IP in the network.
	 * @return: doc-decimal IPv4 address as String. 
	 */
	get_maxhost(){
		if (this.maxhost == null){
			this.maxhost = IPv4Subnet.bin2dot_decimal(this.get_binary_maxhost());
		}
		return this.maxhost;
	}
	
	/*
	 * Returns the address of the first IP in the network.
	 * @return: doc-decimal IPv4 address as String. 
	 */
	get_minhost(){
		if (this.minhost == null){
			this.minhost = IPv4Subnet.bin2dot_decimal(this.get_binary_minhost());
		}
		return this.minhost;
	}
	
	/*
	 * Returns the address of the last IP in the network.
	 * i.e. all host bits except the LSB (least sign. bit) set 1 in the network definition,
	 * LSB gets set to 0.
	 * @return: binary IPv4 address as String. 
	 */
	get_binary_maxhost(){
		if (this.bin_maxhost == null){
			var bin_addr = this.get_binary_addr();
			var tmp = "";
			var host_bits = 32 - this.get_netmask();
			for(var i=0; i<(bin_addr.length-host_bits);i++)
				tmp += bin_addr[i];
			for(var i=0; i<host_bits-1; i++)
				tmp += "1";
			
			tmp += "0";
			
			this.bin_maxhost = tmp;
		}
		return this.bin_maxhost;
	}
	
	/*
	 * Returns the address of the first IP in the network.
	 * i.e. LSB (least sign. bit) set 1 in the network definition.
	 * @return: binary IPv4 address as String. 
	 */
	get_binary_minhost(){
		if (this.bin_minhost == null){
				var bin_addr = this.get_binary_addr();
				bin_addr = this.get_binary_addr(); //,2) & 1);
				
				var tmp = "";
				for(var i=0; i<(bin_addr.length-1); i++){
					tmp += bin_addr[i];
				}
				tmp += "1";
				this.bin_minhost=tmp;
		}
		return this.bin_minhost;
	}
	
	/*
	 * Returns the address from the network definition.
	 * @return: IPv4 address as String.
	 */
	get_address(){
		if( this.address == null ){
			this.address = this.input.split("/")[0].toString();
			//console.log("get_address(): Setting address to "+this.address);
		}
		
		return this.address;
	}
	
	/*
	 * Returns the netmask from the network definition.
	 * @return: Subnet (e.g. 24) as String.
	 */
	get_netmask(){
		if( this.netmask == null ){
			this.netmask = this.input.split("/")[1].toString();
		}
		
		return this.netmask;
	}
	
	/*
	 * Returns the broadcast from the network definition.
	 * @return: Broadcast address (e.g. 128.42.7.255) as String.
	 */
	get_broadcast(){
		if ( this.broadcast == null ){
			var bin_broadcast = this.get_binary_broadcast();
			this.broadcast = IPv4Subnet.bin2dot_decimal(bin_broadcast);
		}
		return this.broadcast;
	}
	
	/*
	 * Returns the netmask in binary form from the network definition.
	 * @return: Subnet (e.g. 11111111 11111111 11111000 00000000) as String.
	 */
	get_binary_netm(){
			if( this.bin_netmask == null ){
				var bin_nm = "1".repeat(parseInt(this.get_netmask()));
				bin_nm += "0".repeat(32 - parseInt(this.get_netmask()));
				this.bin_netmask = bin_nm;
			}
			
			return this.bin_netmask;
	}
	
	/*
	 * Returns the address in binary form.
	 * @return: Address (e.g. 11000000 10101000 00011111 00000100) as String.
	 */
	get_binary_addr(nice){
		if ( this.binary_str == null ){
			this.binary_str = "";
			var octets = IPv4Subnet.get_octets(this.get_address());
			for(var i=0; i< octets.length; i++){		
				var val = IPv4Subnet.dec2bin(octets[i], 8);
				this.binary_str += val;
				if(nice) this.binary_str += " ";
			}	
		}
		
		return this.binary_str;
	}
	
	/*
	 * Returns the broadcast address in binary form.
	 * @return: Address (e.g. 11000000101010000000000011111111) as String.
	 */
	get_binary_broadcast(){
		if ( this.binary_broadcast == null ){
			this.binary_broadcast = "";
			var host_bitmask = this.invert(this.get_binary_netm());
			//console.log("Host bitmask: " + host_bitmask);
			var bin_addr = this.get_binary_addr()
			for(var i=0; i<host_bitmask.length; i++){
				this.binary_broadcast += (parseInt(host_bitmask[i]) | parseInt(bin_addr[i]));
			}
		}
		
		return this.binary_broadcast;
	}
	
	/*
	 * Inverts a binary number.
	 */
	invert(binary){
		var inverted = "";
		for(var i=0; i<binary.length; i++){
			inverted += (parseInt(binary[i])==1?"0":"1");
		}
		
		return inverted;	
	}
	
	
	
	/* 
	 * Checks the format of the input string.
	 * Accepts IPv4 format in dotted-decimal notation 
	 * with '/' (slash) seperated netmask.
	 * 
	 * @param: the input string to check
	 * @return: 
	 *		true - if the string does match the expected format,
	 *		false - otherwise.
	 */
	is_valid_format(){
		
		/* aaa.bbb.ccc.ddd/ee */
		
		/* 1. string must contain a '/' (slash) */
		var on_slash = this.input.split("/");
		
		if (on_slash.length==2){
				//address = on_slash[0];
				//netmask = on_slash[1];
				
				/* 2. address and netmask are valid */		
				if (IPv4Subnet.is_valid_address(this.get_address()) && IPv4Subnet.is_valid_netmask(this.get_netmask())){
					return true;
				}
		}

		return false;	
	}
	
	/* 
		########################################
			Static methods
		########################################
	 */  
	
	/*
	 * Returns particular octets from the dotted-decimal notation as array.
	 * @param: a valid ip address in dot-decimal format
	 * @return: octets (4 decimal numbers) as Array.
	 */
	static get_octets(ip_addr){
		return ip_addr.split(".");
	}
	
	/*
	 * Returns binary representation of a decimal number.
	 *
	 * @param: decimal number to convert
	 * @param: length of the output string
	 * @return: binary number as string
	 */ 
	static dec2bin(dec_num, length){
		var val = parseInt(dec_num);
		var binary = "";
		if (val >= 0) {
			 while(length--)
				binary += (val >> length ) & 1; 
			return binary.toString(); //val.toString(2);
		}
	}
	
	/*
	 * Returns decimal representation of a binary number.
	 *
	 * @param: binary number to convert
	 * @return: decimal number as string
	 */ 
	static bin2dec(bin_num){
		return parseInt(bin_num,2).toString(10);	
	}
	
	/*
	 * Returns dot-decimal representation of a binary IPv4 address.
	 *
	 * @param: IPv4 address as binary number to convert
	 * @return: IPv4 in dot-decimal format as string.
	 */
	static bin2dot_decimal(bin_num){
		var res = "";
		res += IPv4Subnet.bin2dec(bin_num.substr(0,8));
		res += ".";	
		res += IPv4Subnet.bin2dec(bin_num.substr(8,8));
		res += ".";	
		res += IPv4Subnet.bin2dec(bin_num.substr(16,8));
		res += ".";	
		res += IPv4Subnet.bin2dec(bin_num.substr(24,8));
		
		return res;	
	}
	
	
	/* 
	 * Checks the format of the input string.
	 * Accepts IPv4 format in dotted-decimal notation. 
	 *  * 
	 * @param: the input string to check
	 * @return: 
	 *		true - if the string does match the expected format,
	 *		false - otherwise.
	 */
	static is_valid_address(addr){
		
		var octets = addr.split("."); //this.get_address().split(".");
		
			
		if (octets.length!=4) return false;
			
		for(var i=0; i<octets.length; i++){
			/* 1. are all octets integers */
			/* 2. 0 < value < 255 */
			var val = parseInt(octets[i],10);
		
			if (!Number.isInteger(val)) return false;
			else if (val<0 || val>255) return false;
		}					
						
		return true;		
	}

	/* 
	 * Checks the format of the input string.
	 * Accepts numbers from the interval <0,32>. 
	 *  
	 * @param: the input string to check
	 * @return: 
	 *		true - if the string does match the expected format,
	 *		false - otherwise.
	 */
	static is_valid_netmask(netmask){
		var val = parseInt(netmask,10);
		if (val<=0 || val>=32) return false;
		return true;
	}
	
}
//:~ end of class IPv4Subnet





/* 
 * A class that parses and manipulates IPv4 dotted-decimal notation
 * subnet definitions.
 */ 

var IPv4SubnetUtils = function() {}; //Class.create(); 
IPv4SubnetUtils.prototype = {
		
	/* initialize by ip range from-to */
	initialize_by_range: function(ip_min, ip_max){
		this.minhost = ip_min;
		this.maxhost = ip_max;
		
		this.bin_minhost = IPv4SubnetUtils.dot_decimal2bin(ip_min);
		this.bin_maxhost = IPv4SubnetUtils.dot_decimal2bin(ip_max);
		this.netmask = IPv4SubnetUtils.get_network_bit_count( this.bin_minhost, this.bin_maxhost );
		this.binary_str = IPv4SubnetUtils.get_binary_network_address( this.bin_minhost, this.netmask );
		this.address = IPv4SubnetUtils.bin2dot_decimal( this.binary_str );
		
	},
	
	get_subnet_definition: function(){
		var subn_def = this.get_address() + "/" + this.get_netmask();
		this.input = subn_def;
		
		return subn_def;	
	},
	
	/* initialize by subnet definition */
	initialize: function(subnet_def){
		this.input = subnet_def;
	},
	
	/*
	 * TODO: comment :-)
	 */
	within: function(ip_addr){
		var ip_addr_bin = "";
		
		if (IPv4SubnetUtils.is_valid_address(ip_addr)){
			var octets = IPv4SubnetUtils.get_octets(ip_addr);
			
			for(var i=0; i<octets.length; i++){
				ip_addr_bin += IPv4SubnetUtils.dec2bin(octets[i],8);
			}				
		}
		
		if (this.get_binary_minhost() <= ip_addr_bin && ip_addr_bin <= this.get_binary_maxhost()){
			return true;
		}
		
		return false;
	},
	
	/*
	 * Returns the address of the last IP in the network.
	 * @return: doc-decimal IPv4 address as String. 
	 */
	get_maxhost: function(){
		if (this.maxhost == null){
			this.maxhost = IPv4SubnetUtils.bin2dot_decimal(this.get_binary_maxhost());
		}
		return this.maxhost;
	},
	
	/*
	 * Returns the address of the first IP in the network.
	 * @return: doc-decimal IPv4 address as String. 
	 */
	get_minhost: function(){
		if (this.minhost == null){
			this.minhost = IPv4SubnetUtils.bin2dot_decimal(this.get_binary_minhost());
		}
		return this.minhost;
	},
	
	/*
	 * Returns the address of the last IP in the network.
	 * i.e. all host bits except the LSB (least sign. bit) set 1 in the network definition,
	 * LSB gets set to 0.
	 * @return: binary IPv4 address as String. 
	 */
	get_binary_maxhost: function(){
		if (this.bin_maxhost == null){
			var bin_addr = this.get_binary_addr();
			var tmp = "";
			var host_bits = 32 - this.get_netmask();
			for(var i=0; i<(bin_addr.length-host_bits);i++)
				tmp += bin_addr[i];
			
			for(var j=0; j<host_bits-1; j++)
				tmp += "1";
			
			tmp += "0";
			
			this.bin_maxhost = tmp;
		}
		return this.bin_maxhost;
	},
	
	/*
	 * Returns the address of the first IP in the network.
	 * i.e. LSB (least sign. bit) set 1 in the network definition.
	 * @return: binary IPv4 address as String. 
	 */
	get_binary_minhost: function(){
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
	},
	
	/*
	 * Returns the address from the network definition.
	 * @return: IPv4 address as String.
	 */
	get_address: function(){
		if( this.address == null ){
			this.address = this.input.split("/")[0].toString();
			//console.log("get_address(): Setting address to "+this.address);
		}
		
		return this.address;
	},
	
	/*
	 * Returns the netmask from the network definition.
	 * @return: Subnet (e.g. 24) as String.
	 */
	get_netmask: function(){
		if( this.netmask == null ){
			this.netmask = this.input.split("/")[1].toString();
		}
		
		return this.netmask;
	},
	
	/*
	 * Returns the broadcast from the network definition.
	 * @return: Broadcast address (e.g. 128.42.7.255) as String.
	 */
	get_broadcast: function(){
		if ( this.broadcast == null ){
			var bin_broadcast = this.get_binary_broadcast();
			this.broadcast = IPv4SubnetUtils.bin2dot_decimal(bin_broadcast);
		}
		return this.broadcast;
	},
	
	/*
	 * Returns the netmask in binary form from the network definition.
	 * @return: Subnet (e.g. 11111111 11111111 11111000 00000000) as String.
	 */
	get_binary_netm: function(){
			if( this.bin_netmask == null ){
				var bin_nm = "1".repeat(parseInt(this.get_netmask()));
				bin_nm += "0".repeat(32 - parseInt(this.get_netmask()));
				this.bin_netmask = bin_nm;
			}
			
			return this.bin_netmask;
	},
	
	/*
	 * Returns the address in binary form.
	 * @return: Address (e.g. 11000000 10101000 00011111 00000100) as String.
	 */
	get_binary_addr: function(nice){
		if ( this.binary_str == null ){
			this.binary_str = "";
			var octets = IPv4SubnetUtils.get_octets(this.get_address());
			for(var i=0; i< octets.length; i++){		
				var val = IPv4SubnetUtils.dec2bin(octets[i], 8);
				this.binary_str += val;
				if(nice) this.binary_str += " ";
			}	
		}
		
		return this.binary_str;
	},
	
	/*
	 * Returns the broadcast address in binary form.
	 * @return: Address (e.g. 11000000101010000000000011111111) as String.
	 */
	get_binary_broadcast: function(){
		if ( this.binary_broadcast == null ){
			this.binary_broadcast = "";
			var host_bitmask = this.invert(this.get_binary_netm());
			//console.log("Host bitmask: " + host_bitmask);
			var bin_addr = this.get_binary_addr();
			for(var i=0; i<host_bitmask.length; i++){
				this.binary_broadcast += (parseInt(host_bitmask[i]) | parseInt(bin_addr[i]));
			}
		}
		
		return this.binary_broadcast;
	},
	
	/*
	 * Inverts a binary number.
	 */
	invert: function(binary){
		var inverted = "";
		for(var i=0; i<binary.length; i++){
			inverted += (parseInt(binary[i])==1?"0":"1");
		}
		
		return inverted;	
	},
	
	
	
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
	is_valid_format: function(){
		
		/* aaa.bbb.ccc.ddd/ee */
		
		/* 1. string must contain a '/' (slash) */
		var on_slash = this.input.split("/");
		
		if (on_slash.length==2){
				//address = on_slash[0];
				//netmask = on_slash[1];
				
				/* 2. address and netmask are valid */		
				if (IPv4SubnetUtils.is_valid_address(this.get_address()) && IPv4SubnetUtils.is_valid_netmask(this.get_netmask())){
					return true;
				}
		}

		return false;	
	},
	
	type: "IPv4SubnetUtils"
	
}; //:~ End of instance specific variable
	
	/* 
		########################################
			Static methods ...
		########################################
	 */  
	
	/*
	 * Returns particular octets from the dotted-decimal notation as array.
	 * @param: a valid ip address in dot-decimal format
	 * @return: octets (4 decimal numbers) as Array.
	 */
	IPv4SubnetUtils.get_octets = function(ip_addr){
		return ip_addr.split(".");
	};
	
	/*
	 * Returns binary representation of a decimal number.
	 *
	 * @param: decimal number to convert
	 * @param: length of the output string
	 * @return: binary number as string
	 */ 
	IPv4SubnetUtils.dec2bin = function(dec_num, length){
		var val = parseInt(dec_num);
		var binary = "";
		if (val >= 0) {
			 while(length--)
				binary += (val >> length ) & 1; 
			return binary.toString(); //val.toString(2);
		}
	};
	
	/*
	 * Returns decimal representation of a binary number.
	 *
	 * @param: binary number to convert
	 * @return: decimal number as string
	 */ 
	IPv4SubnetUtils.bin2dec = function(bin_num){
		return parseInt(bin_num,2).toString(10);	
	};
	
	/*
	 * Returns dot-decimal representation of a binary IPv4 address.
	 *
	 * @param: IPv4 address as binary number to convert
	 * @return: IPv4 in dot-decimal format as string.
	 */
	IPv4SubnetUtils.bin2dot_decimal = function(bin_num){
		var res = "";
		res += IPv4SubnetUtils.bin2dec(bin_num.substr(0,8));
		res += ".";	
		res += IPv4SubnetUtils.bin2dec(bin_num.substr(8,8));
		res += ".";	
		res += IPv4SubnetUtils.bin2dec(bin_num.substr(16,8));
		res += ".";	
		res += IPv4SubnetUtils.bin2dec(bin_num.substr(24,8));
		
		return res;	
	};
	
	
	/* 
	 * Checks the format of the input string.
	 * Accepts IPv4 format in dotted-decimal notation. 
	 *  * 
	 * @param: the input string to check
	 * @return: 
	 *		true - if the string does match the expected format,
	 *		false - otherwise.
	 */
	IPv4SubnetUtils.is_valid_address = function(addr){
		
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
	};

	/* 
	 * Checks the format of the input string.
	 * Accepts numbers from the interval <0,32>. 
	 *  
	 * @param: the input string to check
	 * @return: 
	 *		true - if the string does match the expected format,
	 *		false - otherwise.
	 */
	IPv4SubnetUtils.is_valid_netmask = function(netmask){
		var val = parseInt(netmask,10);
		if (val<=0 || val>=32) return false;
		return true;
	};
	
	/*
	 * Returns binary representation of a dot-decimal IPv4 address.
	 *
	 * @param: IPv4 address as dot-decimal number to convert
	 * @return: IPv4 in binary format as string.
	 */
	IPv4SubnetUtils.dot_decimal2bin = function(ip_addr){
		var res = "";
		// TODO implement this
		var octets = IPv4SubnetUtils.get_octets(ip_addr);
		for(var i=0; i<octets.length; i++){
			res += IPv4SubnetUtils.dec2bin( octets[i], 8 );
		}
		
		return res;	
	};
	
	IPv4SubnetUtils.get_network_bit_count = function(ip_addr1, ip_addr2){
		var counter = 0;
		for(var i=0; i<ip_addr1.length; i++){
			if (ip_addr1[i] == ip_addr2[i]) counter++;
			else break; //return counter;
			if (i > 32) break;
		}
		
		return counter;
	};
	
	IPv4SubnetUtils.get_binary_network_address = function( bin_ip_addr, netmask ){
		var res = "";
		for(var i=0; i<netmask; i++)
			res += bin_ip_addr[i];
		for(var i=netmask; i<bin_ip_addr.length; i++)
			res += "0";
		
		return res;	
	};

//:~ end of class IPv4SubnetUtils
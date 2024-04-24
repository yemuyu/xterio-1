
export class Account {
    id: number;
    address: string | null;
    type: number | null;
    private_key: string;
    create_time: Date | null;
    
    constructor(id: number | null, address: string | null, type: number | null, private_key: string, create_time: Date | null){
        this.id = id;
        this.address = address;
        this.type = type;
        this.private_key = private_key;
        this.create_time = create_time;
    }
  }
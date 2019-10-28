pragma solidity >= 0.4.25 < 0.6.0;

contract Market {

    enum DiaStatus {OnSale, OffSale, Rented}

    struct OpenData {
        string cut;
        string color;
        string clarity;
        string carat;           // Public

        string encGirdleCode;   // Private

        uint32 price;
        DiaStatus   status;     
    }

    constructor () public {
        
    }

}
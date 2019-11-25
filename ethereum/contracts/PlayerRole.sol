pragma solidity >= 0.4.25 < 0.6.0;

import "openzeppelin-solidity/contracts/access/Roles.sol";
import "openzeppelin-solidity/contracts/ownership/Ownable.sol";

contract PlayerRole is Ownable {

    enum Role {None, Wholesaler, Retailer, Gemologist}  // 0, 1, 2, 3
    uint Num_Player = 3;

    using Roles for Roles.Role;
    Roles.Role wholesalers;
    Roles.Role retailers;
    Roles.Role gemologists;

    function addWholesalers(address[] memory _wholesalers) public onlyOwner {
        for (uint i=0; i < _wholesalers.length; i++ ) {
            wholesalers.add(_wholesalers[i]);
        }
    }

    function addRetailers(address[] memory _retailers) public onlyOwner {
        for (uint i=0; i < _retailers.length; i++) {
            retailers.add(_retailers[i]);
        }
    }

    function addGemologists(address[] memory _gemologists) public onlyOwner {
        for (uint i=0; i < _gemologists.length; i++) {
            gemologists.add(_gemologists[i]);
        }
    }
    
    function checkWholesaler (address player) public returns (bool) {
        if (wholesalers.has(player)) {
            return true;
        }
        return false;
    }
    
    function checkRetailer (address player) public returns (bool) {
        if (retailers.has(player)) {
            return true;
        }
        return false;
    }
    
    function checkGemologist (address player) public returns (bool) {
        if (gemologists.has(player)) {
            return true;
        }
        return false;
    }

    function checkPlayerRole (address player) public view returns (Role[] memory) {
        
        Role[] memory  roles = new Role[](Num_Player);
        uint numRoles = 0;
        if (wholesalers.has(player)) {
            roles[numRoles++] = Role.Wholesaler;
        }
        if (retailers.has(player)) {
            roles[numRoles++] = Role.Retailer;
        }
        if (gemologists.has(player)) {
            roles[numRoles++] = Role.Gemologist;
        }

        return roles;
    }
}
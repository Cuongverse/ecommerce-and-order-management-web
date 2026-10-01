package com.it3180hust.model;

public class Size {
    private String name;
    private int quantity;

    Size(){
        name = "noname";
        quantity = 0;
    }

    public String getName(){
        return name;
    }

    public void setName(String name){
        this.name = name;
    }

    public int getQuantity(){
        return quantity;
    }

    public void setQuantity(int quantity){
        this.quantity = quantity;
    }
}

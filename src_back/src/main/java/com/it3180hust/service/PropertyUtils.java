package com.it3180hust.service;

import java.beans.PropertyDescriptor;
import java.util.HashSet;
import java.util.Set;

import org.springframework.beans.BeanWrapper;
import org.springframework.beans.BeanWrapperImpl;

public class PropertyUtils {
    public static String[] getIgnoredPropertyNames(Object source){
        // Wrap the source object to inspect properties via reflection
        final BeanWrapper src = new BeanWrapperImpl(source);

        // retrieve all JavaBean property descriptors (metadata about getters/setters and field names)
        PropertyDescriptor[] pds = src.getPropertyDescriptors();
        
        // emptyNames stores the names of properties that should be ignored
        Set<String> emptyNames = new HashSet<>();
        for (PropertyDescriptor pd : pds){
            Object srcValue = src.getPropertyValue(pd.getName());

            // if the incoming field was omitted or explicitly set to null, mark it to be ignored
            if(srcValue == null){
                emptyNames.add(pd.getName());
            }
        }

        // Never overwrite sensitive fields during an update
        emptyNames.add("id");
        emptyNames.add("reviews");
        emptyNames.add("ratings");
        emptyNames.add("createdAt");

        // String[0] because it allocate an array of the exact required size 
        // from a Collection.toArray()
        return emptyNames.toArray(new String[0]);
    }
}

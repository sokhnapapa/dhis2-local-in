//
// This file was generated by the JavaTM Architecture for XML Binding(JAXB) Reference Implementation, vJAXB 2.1.10 in JDK 6 
// See <a href="http://java.sun.com/xml/jaxb">http://java.sun.com/xml/jaxb</a> 
// Any modifications to this file will be lost upon recompilation of the source schema. 
// Generated on: 2012.02.25 at 10:42:52 PM IST 
//


package org.hisp.dhis.ws;

import javax.xml.bind.annotation.XmlAccessType;
import javax.xml.bind.annotation.XmlAccessorType;
import javax.xml.bind.annotation.XmlElement;
import javax.xml.bind.annotation.XmlRootElement;
import javax.xml.bind.annotation.XmlType;


/**
 * <p>Java class for anonymous complex type.
 * 
 * <p>The following schema fragment specifies the expected content contained within this class.
 * 
 * <pre>
 * &lt;complexType>
 *   &lt;complexContent>
 *     &lt;restriction base="{http://www.w3.org/2001/XMLSchema}anyType">
 *       &lt;sequence>
 *         &lt;element ref="{http://dhis2.org/data}DataSMS"/>
 *       &lt;/sequence>
 *     &lt;/restriction>
 *   &lt;/complexContent>
 * &lt;/complexType>
 * </pre>
 * 
 * 
 */
@XmlAccessorType(XmlAccessType.FIELD)
@XmlType(name = "", propOrder = {
    "dataSMS"
})
@XmlRootElement(name = "SendDataResponse")
public class SendDataResponse {

    @XmlElement(name = "DataSMS", required = true)
    protected DataSMS dataSMS;

    /**
     * Gets the value of the dataSMS property.
     * 
     * @return
     *     possible object is
     *     {@link DataSMS }
     *     
     */
    public DataSMS getDataSMS() {
        return dataSMS;
    }

    /**
     * Sets the value of the dataSMS property.
     * 
     * @param value
     *     allowed object is
     *     {@link DataSMS }
     *     
     */
    public void setDataSMS(DataSMS value) {
        this.dataSMS = value;
    }

}

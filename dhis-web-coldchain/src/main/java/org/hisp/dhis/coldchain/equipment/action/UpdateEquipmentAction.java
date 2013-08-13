package org.hisp.dhis.coldchain.equipment.action;

import java.text.SimpleDateFormat;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import javax.servlet.http.HttpServletRequest;

import org.apache.commons.lang.math.NumberUtils;
import org.apache.struts2.ServletActionContext;
import org.hisp.dhis.coldchain.catalog.Catalog;
import org.hisp.dhis.coldchain.catalog.CatalogService;
import org.hisp.dhis.coldchain.inventory.Equipment;
import org.hisp.dhis.coldchain.inventory.EquipmentInstance;
import org.hisp.dhis.coldchain.inventory.EquipmentInstanceService;
import org.hisp.dhis.coldchain.inventory.EquipmentService;
import org.hisp.dhis.coldchain.inventory.EquipmentStatus;
import org.hisp.dhis.coldchain.inventory.EquipmentStatusService;
import org.hisp.dhis.coldchain.inventory.InventoryType;
import org.hisp.dhis.coldchain.inventory.InventoryTypeAttribute;
import org.hisp.dhis.coldchain.inventory.InventoryTypeAttributeOption;
import org.hisp.dhis.coldchain.inventory.InventoryTypeAttributeOptionService;
import org.hisp.dhis.coldchain.inventory.InventoryType_Attribute;
import org.hisp.dhis.i18n.I18nFormat;
import org.hisp.dhis.user.CurrentUserService;

import com.opensymphony.xwork2.Action;

public class UpdateEquipmentAction implements Action
{

    public static final String PREFIX_ATTRIBUTE = "attr";

    // -------------------------------------------------------------------------
    // Dependencies
    // -------------------------------------------------------------------------
    
    private InventoryTypeAttributeOptionService inventoryTypeAttributeOptionService;
    
    private EquipmentInstanceService equipmentInstanceService;

    private EquipmentService equipmentService;
    
    private CatalogService catalogService;
    
    private CurrentUserService currentUserService;
    
    public void setCurrentUserService( CurrentUserService currentUserService )
    {
        this.currentUserService = currentUserService;
    }
    
    private EquipmentStatusService equipmentStatusService;
    
    public void setEquipmentStatusService( EquipmentStatusService equipmentStatusService )
    {
        this.equipmentStatusService = equipmentStatusService;
    }

    private I18nFormat format;
    
    public void setFormat( I18nFormat format )
    {
        this.format = format;
    }

    // -------------------------------------------------------------------------
    // Input/ Output
    // -------------------------------------------------------------------------
    
    private Integer equipmentInstanceID;
    
    private String message;
    
    private Integer catalog;
    
    public void setCatalog( Integer catalog )
    {
        this.catalog = catalog;
    }
    
    // -------------------------------------------------------------------------
    // Action implementation
    // -------------------------------------------------------------------------
    public String execute()
    {

        //System.out.println("inside UpdateEquipmentAction : "+ equipmentInstanceID);
        
        EquipmentInstance equipmentInstance = equipmentInstanceService.getEquipmentInstance( equipmentInstanceID );
        
        InventoryType inventoryType = equipmentInstance.getInventoryType();
        
        Catalog selCatalog = null;
        
        if( catalog != null )
        {    
            selCatalog = catalogService.getCatalog( catalog );
        }
        
        if( selCatalog != null )
        {
            equipmentInstance.setCatalog( selCatalog );
            
            equipmentInstanceService.updateEquipmentInstance( equipmentInstance );
        }
        
        // -----------------------------------------------------------------------------
        // Preparing Equipment Details
        // -----------------------------------------------------------------------------
        HttpServletRequest request = ServletActionContext.getRequest();
        String value = null;
        
        List<InventoryTypeAttribute> inventoryTypeAttributes = new ArrayList<InventoryTypeAttribute>( );
        
        for( InventoryType_Attribute inventoryType_Attribute : inventoryType.getInventoryType_Attributes() )
        {
            inventoryTypeAttributes.add( inventoryType_Attribute.getInventoryTypeAttribute() );
        }
        
        Equipment equipmentDetails = null;
        for ( InventoryTypeAttribute attribute : inventoryTypeAttributes )
        {
            value = request.getParameter( PREFIX_ATTRIBUTE + attribute.getId() );
            
            equipmentDetails = equipmentService.getEquipment( equipmentInstance, attribute );
            
            if( equipmentDetails == null && value != null )
            {
                equipmentDetails = new Equipment();
                equipmentDetails.setEquipmentInstance( equipmentInstance );
                equipmentDetails.setInventoryTypeAttribute( attribute );

                if ( InventoryTypeAttribute.TYPE_COMBO.equalsIgnoreCase( attribute.getValueType() ) )
                {
                    InventoryTypeAttributeOption option = inventoryTypeAttributeOptionService.getInventoryTypeAttributeOption( NumberUtils.toInt( value, 0 ) );
                    if ( option != null )
                    {
                        equipmentDetails.setInventoryTypeAttributeOption( option );
                        equipmentDetails.setValue( option.getName() );
                        
                        if ( EquipmentStatus.WORKING_STATUS.equalsIgnoreCase( attribute.getDescription() ) )
                        {
                            //System.out.println( "Option ID is  : " + option.getId() + "---Option Name is : "+option.getName() );
                            
                            if ( EquipmentStatus.STATUS_NOT_WORKING.equalsIgnoreCase( option.getName() ) )
                            {
                                equipmentInstance.setWorking( false );
                                equipmentInstanceService.updateEquipmentInstance( equipmentInstance );
                            }
                            else
                            {
                                equipmentInstance.setWorking( true );
                                equipmentInstanceService.updateEquipmentInstance( equipmentInstance );
                            }
                            
                            
                            String storedBy = currentUserService.getCurrentUsername();
                            
                            EquipmentStatus equipmentStatus = new EquipmentStatus();
                            
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");      
                            String currentDate = sdf.format(new Date());

                            equipmentStatus.setDescription( "Updated from edit equipment screen" );
                            equipmentStatus.setEquipmentInstance( equipmentInstance );
                            equipmentStatus.setStatus( option.getName() );
                            
                            equipmentStatus.setReportingDate( format.parseDate( currentDate.trim() ) );
                            equipmentStatus.setUpdationDate( format.parseDate( currentDate.trim() ) );
                            equipmentStatus.setStoredBy( storedBy );
                            
                            equipmentStatusService.addEquipmentStatus( equipmentStatus );
                            
                        }
                        
                    }
                    
                    else
                    {
                        // Someone deleted this option ...
                    }
                }
                else if ( InventoryTypeAttribute.TYPE_CATALOG.equalsIgnoreCase( attribute.getValueType() ) )
                {
                    Catalog catalog = catalogService.getCatalog( NumberUtils.toInt( value, 0 ) );
                    if ( catalog != null )
                    {
                        //equipmentDetails.setInventoryTypeAttributeOption( option );
                        equipmentDetails.setValue( catalog.getName() );
                    }
                    else
                    {
                        // Someone deleted this catalog ...
                    }
                }
                else
                {
                    equipmentDetails.setValue( value.trim() );
                }
                
                equipmentService.addEquipment( equipmentDetails );
            }
            else
            {
                if ( InventoryTypeAttribute.TYPE_COMBO.equalsIgnoreCase( attribute.getValueType() ) )
                {
                    InventoryTypeAttributeOption option = inventoryTypeAttributeOptionService.getInventoryTypeAttributeOption( NumberUtils.toInt( value, 0 ) );
                    
                    //System.out.println( " Option is  : " + option + "-- and value is --" + value.trim());
                    
                    if ( option != null )
                    {
                        equipmentDetails.setInventoryTypeAttributeOption( option );
                        equipmentDetails.setValue( option.getName() );
                        
                        
                        if ( EquipmentStatus.WORKING_STATUS.equalsIgnoreCase( attribute.getDescription() ) )
                        {
                            //System.out.println( " Option ID is  : " + option.getId() + "---Option Name is : " + option.getName() );
                            
                            if ( EquipmentStatus.STATUS_NOT_WORKING.equalsIgnoreCase( option.getName() ) )
                            {
                                equipmentInstance.setWorking( false );
                                equipmentInstanceService.updateEquipmentInstance( equipmentInstance );
                            }
                            else
                            {
                                equipmentInstance.setWorking( true );
                                equipmentInstanceService.updateEquipmentInstance( equipmentInstance );
                            }
                            
                            String storedBy = currentUserService.getCurrentUsername();
                            
                            EquipmentStatus equipmentStatus = new EquipmentStatus();
                            
                            SimpleDateFormat sdf = new SimpleDateFormat("yyyy-MM-dd");      
                            String currentDate = sdf.format(new Date());

                            equipmentStatus.setDescription( "Updated from edit equipment screen" );
                            equipmentStatus.setEquipmentInstance( equipmentInstance );
                            equipmentStatus.setStatus( option.getName() );
                            
                            equipmentStatus.setReportingDate( format.parseDate( currentDate.trim() ) );
                            equipmentStatus.setUpdationDate( format.parseDate( currentDate.trim() ) );
                            equipmentStatus.setStoredBy( storedBy );
                            
                            equipmentStatusService.addEquipmentStatus( equipmentStatus );
                            
                        }
                        
                    }
                    else
                    {
                        // Someone deleted this option ...
                        equipmentDetails.setValue( value.trim() );
                    }
                }
                else if ( InventoryTypeAttribute.TYPE_CATALOG.equalsIgnoreCase( attribute.getValueType() ) )
                {
                    Catalog catalog = catalogService.getCatalog( NumberUtils.toInt( value, 0 ) );
                    if ( catalog != null )
                    {
                        //equipmentDetails.setInventoryTypeAttributeOption( option );
                        equipmentDetails.setValue( catalog.getName() );
                    }
                    else
                    {
                        // Someone deleted this catalog ...
                        equipmentDetails.setValue( value.trim() );
                    }
                }
                else
                {
                    equipmentDetails.setValue( value.trim() );
                }

                equipmentService.updateEquipment( equipmentDetails );
            }
                
        }
         
        message = ""+ equipmentInstanceID;
        
        return SUCCESS;
    }

    // -------------------------------------------------------------------------
    // Setters & Getters
    // -------------------------------------------------------------------------

    public String getMessage()
    {
        return message;
    }

    public void setInventoryTypeAttributeOptionService(
        InventoryTypeAttributeOptionService inventoryTypeAttributeOptionService )
    {
        this.inventoryTypeAttributeOptionService = inventoryTypeAttributeOptionService;
    }

    public void setEquipmentInstanceService( EquipmentInstanceService equipmentInstanceService )
    {
        this.equipmentInstanceService = equipmentInstanceService;
    }

    public void setEquipmentService( EquipmentService equipmentService )
    {
        this.equipmentService = equipmentService;
    }

    public void setEquipmentInstanceID( Integer equipmentInstanceID )
    {
        this.equipmentInstanceID = equipmentInstanceID;
    }

    public void setCatalogService( CatalogService catalogService )
    {
        this.catalogService = catalogService;
    }

}

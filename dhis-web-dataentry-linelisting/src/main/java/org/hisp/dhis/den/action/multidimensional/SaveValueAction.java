package org.hisp.dhis.den.action.multidimensional;

/*
 * Copyright (c) 2004-2007, University of Oslo
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * * Redistributions of source code must retain the above copyright notice, this
 *   list of conditions and the following disclaimer.
 * * Redistributions in binary form must reproduce the above copyright notice,
 *   this list of conditions and the following disclaimer in the documentation
 *   and/or other materials provided with the distribution.
 * * Neither the name of the HISP project nor the names of its contributors may
 *   be used to endorse or promote products derived from this software without
 *   specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON
 * ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

import java.util.Date;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hisp.dhis.dataelement.DataElement;
import org.hisp.dhis.dataelement.DataElementCategoryOptionCombo;
import org.hisp.dhis.dataelement.DataElementCategoryService;
import org.hisp.dhis.dataelement.DataElementService;
import org.hisp.dhis.den.api.LLDataValue;
import org.hisp.dhis.den.api.LLDataValueService;
import org.hisp.dhis.den.state.SelectedStateManager;
import org.hisp.dhis.organisationunit.OrganisationUnit;
import org.hisp.dhis.period.Period;
import org.hisp.dhis.user.CurrentUserService;

import com.opensymphony.xwork2.Action;

/**
 * @author Abyot Asalefew
 * @version $Id$
 */

public class SaveValueAction
    implements Action
{
    private static final Log LOG = LogFactory.getLog( SaveValueAction.class );

    // -------------------------------------------------------------------------
    // Dependencies
    // -------------------------------------------------------------------------

    private CurrentUserService currentUserService;

    public void setCurrentUserService( CurrentUserService currentUserService )
    {
        this.currentUserService = currentUserService;
    }

    private DataElementService dataElementService;

    public void setDataElementService( DataElementService dataElementService )
    {
        this.dataElementService = dataElementService;
    }

    private LLDataValueService dataValueService;

    public void setDataValueService( LLDataValueService dataValueService )
    {
        this.dataValueService = dataValueService;
    }

    private SelectedStateManager selectedStateManager;

    public void setSelectedStateManager( SelectedStateManager selectedStateManager )
    {
        this.selectedStateManager = selectedStateManager;
    }
    
    private DataElementCategoryService dataElementCategoryService;

    public void setDataElementCategoryService( DataElementCategoryService dataElementCategoryService )
    {
        this.dataElementCategoryService = dataElementCategoryService;
    }
    
    // -------------------------------------------------------------------------
    // Input/output
    // -------------------------------------------------------------------------

    private String value;

    public void setValue( String value )
    {
        this.value = value;
    }

    private int dataElementId;

    public void setDataElementId( int dataElementId )
    {
        this.dataElementId = dataElementId;
    }

    public int getDataElementId()
    {
        return dataElementId;
    }
    
    private int optionComboId;

    public void setOptionComboId( int optionComboId )
    {
        this.optionComboId = optionComboId;
    }

    public int getOptionComboId()
    {
        return optionComboId;
    }

    private int statusCode;

    public int getStatusCode()
    {
        return statusCode;
    }

    private Date timestamp;

    public Date getTimestamp()
    {
        return timestamp;
    }

    private String storedBy;

    public String getStoredBy()
    {
        return storedBy;
    }
    
    private String inputId;

    public String getInputId()
    {
        return inputId;
    }
    
    public void setInputId( String inputId )
    {
    	this.inputId = inputId;
    }

    // -------------------------------------------------------------------------
    // Action implementation
    // -------------------------------------------------------------------------

    public String execute()
    {
        OrganisationUnit organisationUnit = selectedStateManager.getSelectedOrganisationUnit();
        Period period = selectedStateManager.getSelectedPeriod();
            
        dataElementId = Integer.parseInt( inputId.substring( 0, inputId.indexOf(':') ) );
        optionComboId = Integer.parseInt( inputId.substring( inputId.indexOf(':')+1, inputId.length() ) );
                
        DataElement dataElement = dataElementService.getDataElement( dataElementId );        
        storedBy = currentUserService.getCurrentUsername();               
        DataElementCategoryOptionCombo optionCombo = dataElementCategoryService.getDataElementCategoryOptionCombo( optionComboId );
             
        if ( storedBy == null )
        {
            storedBy = "[unknown]";
        }

        if ( value != null && value.trim().equals( "" ) )
        {
            value = null;
        }

        // ---------------------------------------------------------------------
        // Update DB
        // ---------------------------------------------------------------------

        /*
        DataValue dataValue = dataValueService.getDataValue( organisationUnit, dataElement, period,optionCombo  );        

        if ( dataValue == null )
        {
            if ( value != null )
            {
                LOG.debug( "Adding DataValue, value added" );

                dataValue = new DataValue( dataElement, period, organisationUnit, value, storedBy, new Date(), null, optionCombo );
                dataValueService.addDataValue( dataValue );
            }
        }
        else
        {
            LOG.debug( "Updating DataValue, value added/changed" );

            dataValue.setValue( value );
            dataValue.setTimestamp( new Date() );
            dataValue.setStoredBy( storedBy );
                        
            dataValueService.updateDataValue( dataValue );
        }

        if ( dataValue != null )
        {
            this.timestamp = dataValue.getTimestamp();
            this.storedBy = dataValue.getStoredBy();
        }
        */

        int recordNo = 1;
        LOG.debug( "Adding DataValue, value added" );

        LLDataValue dataValue = new LLDataValue( dataElement, period, organisationUnit, value, storedBy, new Date(), null, optionCombo, recordNo);
        dataValueService.addDataValue( dataValue );
        
        return SUCCESS;
    }
}

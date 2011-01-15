package org.hisp.dhis.detarget.action;

import java.util.ArrayList;
import java.util.Collection;
import java.util.List;

import org.hisp.dhis.detarget.DeTarget;
import org.hisp.dhis.detarget.DeTargetService;
import org.hisp.dhis.i18n.I18nFormat;
import org.hisp.dhis.organisationunit.OrganisationUnit;
import org.hisp.dhis.period.Period;
import org.hisp.dhis.survey.state.SelectedStateManager;

import com.opensymphony.xwork2.Action;

public class SelectAction
implements Action
{
    //--------------------------------------------------------------------------
    //Dependencies
    //--------------------------------------------------------------------------
    
    private SelectedStateManager selectedStateManager;
    
    public void setSelectedStateManager( SelectedStateManager selectedStateManager )
    {
        this.selectedStateManager = selectedStateManager;
    }
    
    private DeTargetService deTargetService;
    
    public void setDeTargetService( DeTargetService deTargetService )
    {
        this.deTargetService = deTargetService;
    }
    
    private I18nFormat format;

    public void setFormat( I18nFormat format )
    {
        this.format = format;
    }
    
    //--------------------------------------------------------------------------
    //Input/Output
    //--------------------------------------------------------------------------
    
    private OrganisationUnit orgUnit;
    
    public OrganisationUnit getOrgUnit()
    {
        return orgUnit;
    }

    private List<DeTarget> deTargets = new ArrayList<DeTarget>();
    
    public List<DeTarget> getDeTargets()
    {
        return deTargets;
    }
    
    private Period period;
    
    public Period getPeriod()
    {
        return period;
    }
    
    private Integer selectedDeTargetId;
    
    public Integer getSelectedDeTargetId()
    {
        return selectedDeTargetId;
    }

    public void setSelectedDeTargetId( Integer selectedDeTargetId )
    {
        this.selectedDeTargetId = selectedDeTargetId;
    }
    
    private Integer selectedPeriodIndex;

    public Integer getSelectedPeriodIndex()
    {
        return selectedPeriodIndex;
    }

    public void setSelectedPeriodIndex( Integer selectedPeriodIndex )
    {
        this.selectedPeriodIndex = selectedPeriodIndex;
    }

    private List<Period> periods = new ArrayList<Period>();

    public Collection<Period> getPeriods()
    {
        return periods;
    }


    //--------------------------------------------------------------------------
    //Action Implementation
    //--------------------------------------------------------------------------

    public String execute()
    {
        orgUnit = selectedStateManager.getSelectedOrganisationUnit();
        
        if( orgUnit == null )
        {
            selectedDeTargetId = null;
            
            selectedStateManager.clearSelectedDeTarget();
            
            return SUCCESS;
        }
        
        // ---------------------------------------------------------------------
        // Load Targets
        // ---------------------------------------------------------------------
        
        deTargets = selectedStateManager.loadDeTargetsForSelectedOrgUnit( orgUnit );
        
        DeTarget selectedDeTarget;
        
        if( selectedDeTargetId != null )
        {
            selectedDeTarget = deTargetService.getDeTarget( selectedDeTargetId );
        }
        else
        {
            selectedDeTarget = selectedStateManager.getSelectedDeTarget();
        }
        
        if( selectedDeTarget != null && deTargets.contains( selectedDeTarget ) )
        {
            selectedDeTargetId = selectedDeTarget.getId();
            
            selectedStateManager.setSelectedDeTarget( selectedDeTarget );
            
            periods = selectedStateManager.getPeriodList();
            
            for ( Period period : periods )
            {
                period.setName( format.formatPeriod( period ) );
            }
        }
        else
        {
            selectedDeTargetId = null;
            
            selectedStateManager.clearSelectedDeTarget();
            
            return SUCCESS;
        }
        
        // ---------------------------------------------------------------------
        // Validate selected period
        // ---------------------------------------------------------------------

        if ( selectedPeriodIndex == null )
        {
            selectedPeriodIndex = selectedStateManager.getSelectedPeriodIndex();
            
        }

        if ( selectedPeriodIndex != null && selectedPeriodIndex >= 0 )
        {
            selectedStateManager.setSelectedPeriodIndex( selectedPeriodIndex );
            
            period = selectedStateManager.getSelectedPeriod();
        }
        
        
        else
        {
            selectedStateManager.clearSelectedPeriod();

            return SUCCESS;
        }
        return "defaulttargetform";
    }

}

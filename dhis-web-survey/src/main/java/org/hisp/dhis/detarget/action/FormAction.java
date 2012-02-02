package org.hisp.dhis.detarget.action;

import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.hisp.dhis.dataelement.DataElementCategory;
import org.hisp.dhis.dataelement.DataElementCategoryCombo;
import org.hisp.dhis.dataelement.DataElementCategoryOption;
import org.hisp.dhis.dataelement.DataElementCategoryOptionCombo;
import org.hisp.dhis.detarget.DeTarget;
import org.hisp.dhis.detarget.DeTargetMember;
import org.hisp.dhis.detarget.DeTargetService;
import org.hisp.dhis.detargetdatavalue.DeTargetDataValue;
import org.hisp.dhis.detargetdatavalue.DeTargetDataValueService;
import org.hisp.dhis.i18n.I18n;
import org.hisp.dhis.organisationunit.OrganisationUnit;
import org.hisp.dhis.period.Period;
import org.hisp.dhis.period.PeriodService;
import org.hisp.dhis.survey.state.SelectedStateManager;

import com.opensymphony.xwork2.Action;

public class FormAction
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
    
    private DeTargetDataValueService deTargetDataValueService;
    
    public void setDeTargetDataValueService( DeTargetDataValueService deTargetDataValueService )
    {
        this.deTargetDataValueService = deTargetDataValueService;
    }
    
    private DeTargetService deTargetService;
    
    public void setDeTargetService( DeTargetService deTargetService )
    {
        this.deTargetService = deTargetService;
    }

    private PeriodService periodService;
    
    public void setPeriodService( PeriodService periodService )
    {
        this.periodService = periodService;
    }

    @SuppressWarnings("unused")
    private I18n i18n;

    public void setI18n( I18n i18n )
    {
        this.i18n = i18n;
    } 
   
    // -------------------------------------------------------------------------
    // DisplayPropertyHandler
    // -------------------------------------------------------------------------
   
    
    /*
    private DisplayPropertyHandler displayPropertyHandler;

    public void setDisplayPropertyHandler( DisplayPropertyHandler displayPropertyHandler )
    {
        this.displayPropertyHandler = displayPropertyHandler;
    }
    */
    //--------------------------------------------------------------------------
    //Input/Output
    //--------------------------------------------------------------------------
    
    
    private Integer selectedDeTargetId;
    
    public Integer getSelectedDeTargetId()
    {
        return selectedDeTargetId;
    }

    public void setSelectedDeTargetId( Integer selectedDeTargetId )
    {
        this.selectedDeTargetId = selectedDeTargetId;
    }

    private List<DataElementCategoryCombo> orderedCategoryCombos = new ArrayList<DataElementCategoryCombo>();

    public List<DataElementCategoryCombo> getOrderedCategoryCombos()
    {
        return orderedCategoryCombos;
    }
    
    private Collection<DataElementCategoryOptionCombo> allOptionCombos = new ArrayList<DataElementCategoryOptionCombo>();

    public Collection<DataElementCategoryOptionCombo> getAllOptionCombos()
    {
        return allOptionCombos;
    }
    
    private Map<Integer, Collection<DataElementCategoryOptionCombo>> orderdCategoryOptionCombos = new HashMap<Integer, Collection<DataElementCategoryOptionCombo>>();

    public Map<Integer, Collection<DataElementCategoryOptionCombo>> getOrderdCategoryOptionCombos()
    {
        return orderdCategoryOptionCombos;
    }
    
    private Map<Integer, Map<Integer, Collection<DataElementCategoryOption>>> orderedOptionsMap = new HashMap<Integer, Map<Integer, Collection<DataElementCategoryOption>>>();

    public Map<Integer, Map<Integer, Collection<DataElementCategoryOption>>> getOrderedOptionsMap()
    {
        return orderedOptionsMap;
    }

    private Map<Integer, Collection<DataElementCategory>> orderedCategories = new HashMap<Integer, Collection<DataElementCategory>>();

    public Map<Integer, Collection<DataElementCategory>> getOrderedCategories()
    {
        return orderedCategories;
    }

    private Map<Integer, Integer> numberOfTotalColumns = new HashMap<Integer, Integer>();

    public Map<Integer, Integer> getNumberOfTotalColumns()
    {
        return numberOfTotalColumns;
    }
    
    private Map<String, DeTargetDataValue> deTargetDataValueMap;
    
    public Map<String, DeTargetDataValue> getDeTargetDataValueMap()
    {
        return deTargetDataValueMap;
    }

    private List<DeTargetMember> deTargetmembers;
    
    public List<DeTargetMember> getDeTargetmembers()
    {
        return deTargetmembers;
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
    
    
    //--------------------------------------------------------------------------
    //Action Implementation
    //--------------------------------------------------------------------------

    public String execute()
    {
        deTargetDataValueMap = new HashMap<String, DeTargetDataValue>();
        
        OrganisationUnit orgUnit = selectedStateManager.getSelectedOrganisationUnit();
        
        DeTarget deTarget = selectedStateManager.getSelectedDeTarget();
        
        Period period = selectedStateManager.getSelectedPeriod();
        
        period = periodService.reloadPeriod( period );
        
        deTargetmembers = new ArrayList<DeTargetMember> ( deTargetService.getDeTargetMembers( deTarget ) );
 
        // ---------------------------------------------------------------------
        // Get the target Value and create a map
        // ---------------------------------------------------------------------

        Collection<DeTargetDataValue> deTargetDataValues = deTargetDataValueService.getDeTargetDataValues( deTarget, orgUnit, period );
        
        
        for( DeTargetDataValue deTargetDataValue : deTargetDataValues)
        {
            String deOptionCombiId = deTargetDataValue.getDataelement().getId() + ":" + deTargetDataValue.getDecategoryOptionCombo().getId();
            
            deTargetDataValueMap.put( deOptionCombiId, deTargetDataValue );
        }
        
        return SUCCESS;
    }

}

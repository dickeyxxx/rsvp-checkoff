Ext.ns('rsvp');

Ext.ux.UniversalUI = Ext.extend(Ext.Panel, {
    fullscreen: true,
    layout: 'card',
    items: [{
        cls: 'launchscreen',
        html: '<div><img src="/img/sencha.png" width="210" height="291" /><h1>Welcome to Sencha Touch</h1><p>This is a comprehensive collection of our examples in an <br /> easy-to-navigate format. Each sample has a “view source” button which dynamically displays its associated code.<br /><br /><span>Sencha Touch (' + Ext.version +')</span></p></div>'
    }],
    backText: 'Back',
    useTitleAsBackText: true,
    initComponent : function() {
        this.navigationButton = new Ext.Button({
            hidden: Ext.is.Phone || Ext.Viewport.orientation == 'landscape',
            text: 'Navigation',
            handler: this.onNavButtonTap,
            scope: this
        });

        this.backButton = new Ext.Button({
            text: this.backText,
            ui: 'back',
            handler: this.onUiBack,
            hidden: true,
            scope: this
        });
        var btns = [this.navigationButton];
        if (Ext.is.Phone) {
            btns.unshift(this.backButton);
        }

        this.navigationBar = new Ext.Toolbar({
            ui: 'dark',
            dock: 'top',
            title: this.title,
            items: btns.concat(this.buttons || [])
        });

        this.navigationPanel = new Ext.NestedList({
            //store: sink.StructureStore,
            useToolbar: Ext.is.Phone ? false : true,
            updateTitleText: false,
            dock: 'left',
            hidden: !Ext.is.Phone && Ext.Viewport.orientation == 'portrait',
            toolbar: Ext.is.Phone ? this.navigationBar : null,
            listeners: {
                itemtap: this.onNavPanelItemTap,
                scope: this
            }
        });

        this.navigationPanel.on('back', this.onNavBack, this);

        if (!Ext.is.Phone) {
            this.navigationPanel.setWidth(250);
        }

        this.dockedItems = this.dockedItems || [];
        this.dockedItems.unshift(this.navigationBar);

        if (!Ext.is.Phone && Ext.Viewport.orientation == 'landscape') {
            this.dockedItems.unshift(this.navigationPanel);
        }
        else if (Ext.is.Phone) {
            this.items = this.items || [];
            this.items.unshift(this.navigationPanel);
        }

        this.addEvents('navigate');


        Ext.ux.UniversalUI.superclass.initComponent.call(this);
    },

    toggleUiBackButton: function() {
        var navPnl = this.navigationPanel;

        if (Ext.is.Phone) {
            if (this.getActiveItem() === navPnl) {

                var currList      = navPnl.getActiveItem(),
                    currIdx       = navPnl.items.indexOf(currList),
                    recordNode    = currList.recordNode,
                    title         = navPnl.renderTitleText(recordNode),
                    parentNode    = recordNode ? recordNode.parentNode : null,
                    backTxt       = (parentNode && !parentNode.isRoot) ? navPnl.renderTitleText(parentNode) : this.title || '',
                    activeItem;


                if (currIdx <= 0) {
                    this.navigationBar.setTitle(this.title || '');
                    this.backButton.hide();
                } else {
                    this.navigationBar.setTitle(title);
                    if (this.useTitleAsBackText) {
                        this.backButton.setText(backTxt);
                    }

                    this.backButton.show();
                }
            // on a demo
            } else {
                activeItem = navPnl.getActiveItem();
                recordNode = activeItem.recordNode;
                backTxt    = (recordNode && !recordNode.isRoot) ? navPnl.renderTitleText(recordNode) : this.title || '';

                if (this.useTitleAsBackText) {
                    this.backButton.setText(backTxt);
                }
                this.backButton.show();
            }
            this.navigationBar.doLayout();
        }

    },

    onUiBack: function() {
        var navPnl = this.navigationPanel;

        // if we already in the nested list
        if (this.getActiveItem() === navPnl) {
            navPnl.onBackTap();
        // we were on a demo, slide back into
        // navigation
        } else {
            this.setActiveItem(navPnl, {
                type: 'slide',
                reverse: true
            });
        }
        this.toggleUiBackButton();
        this.fireEvent('navigate', this, {});
    },

    onNavPanelItemTap: function(subList, subIdx, el, e) {
        var store      = subList.getStore(),
            record     = store.getAt(subIdx),
            recordNode = record.node,
            nestedList = this.navigationPanel,
            title      = nestedList.renderTitleText(recordNode),
            card, preventHide, anim;

        if (record) {
            card        = record.get('card');
            anim        = record.get('cardSwitchAnimation');
            preventHide = record.get('preventHide');
        }

        if (Ext.Viewport.orientation == 'portrait' && !Ext.is.Phone && !recordNode.childNodes.length && !preventHide) {
            this.navigationPanel.hide();
        }

        if (card) {
            this.setActiveItem(card, anim || 'slide');
            this.currentCard = card;
        }

        if (title) {
            this.navigationBar.setTitle(title);
        }
        this.toggleUiBackButton();
        this.fireEvent('navigate', this, record);
    },

    onNavButtonTap : function() {
        this.navigationPanel.showBy(this.navigationButton, 'fade');
    },

    layoutOrientation : function(orientation, w, h) {
        if (!Ext.is.Phone) {
            if (orientation == 'portrait') {
                this.navigationPanel.hide(false);
                this.removeDocked(this.navigationPanel, false);
                if (this.navigationPanel.rendered) {
                    this.navigationPanel.el.appendTo(document.body);
                }
                this.navigationPanel.setFloating(true);
                this.navigationPanel.setHeight(400);
                this.navigationButton.show(false);
            }
            else {
                this.navigationPanel.setFloating(false);
                this.navigationPanel.show(false);
                this.navigationButton.hide(false);
                this.insertDocked(0, this.navigationPanel);
            }
            this.navigationBar.doComponentLayout();
        }

        Ext.ux.UniversalUI.superclass.layoutOrientation.call(this, orientation, w, h);
    }
});



rsvp.Main = {
    init : function() {
        this.connectButton = new Ext.Button({
            text: 'Connect with Meetup.com',
            ui: 'action',
            //hidden: true,
            handler: this.onAuthorizeButtonTap,
            scope: this
        });

        this.ui = new Ext.ux.UniversalUI({
            title: Ext.is.Phone ? 'RSVP' : 'RSVP Checkoff List',
            useTitleAsBackText: false,
            //navigationItems: sink.Structure,
            buttons: [{xtype: 'spacer'}, this.sourceButton],
        });
    },

    onAuthorizeButtonTap : function() {
        window.location = "/auth/meetup";
}};


Ext.setup({
    tabletStartupScreen: '/img/tablet_startup.png',
    phoneStartupScreen: '/img/phone_startup.png',
    icon: '/img/icon.png',
    glossOnIcon: true,

    onReady: function() {
        rsvp.Main.init();
    }
});
/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */
import * as tslib_1 from "tslib";
import { Component, NgZone, Input, Output, EventEmitter, forwardRef, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { getEditorNamespace } from './ckeditor.helpers';
var CKEditorComponent = /** @class */ (function () {
    function CKEditorComponent(elementRef, ngZone) {
        this.elementRef = elementRef;
        this.ngZone = ngZone;
        /**
         * Tag name of the editor component.
         *
         * The default tag is `textarea`.
         */
        this.tagName = 'textarea';
        /**
         * The type of the editor interface.
         *
         * By default editor interface will be initialized as `divarea` editor which is an inline editor with fixed UI.
         * You can change interface type by choosing between `divarea` and `inline` editor interface types.
         *
         * See https://ckeditor.com/docs/ckeditor4/latest/guide/dev_uitypes.html
         * and https://ckeditor.com/docs/ckeditor4/latest/examples/fixedui.html
         * to learn more.
         */
        this.type = "classic" /* CLASSIC */;
        /**
         * Fires when the editor is ready. It corresponds with the `editor#instanceReady`
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-instanceReady
         * event.
         */
        this.ready = new EventEmitter();
        this.created = new EventEmitter();
        /**
         * Fires when the editor data is loaded, e.g. after calling setData()
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#method-setData
         * editor's method. It corresponds with the `editor#dataReady`
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-dataReady event.
         */
        this.dataReady = new EventEmitter();
        /**
         * Fires when the content of the editor has changed. It corresponds with the `editor#change`
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-change
         * event. For performance reasons this event may be called even when data didn't really changed.
         * Please note that this event will only be fired when `undo` plugin is loaded. If you need to
         * listen for editor changes (e.g. for two-way data binding), use `dataChange` event instead.
         */
        this.change = new EventEmitter();
        /**
         * Fires when the content of the editor has changed. In contrast to `change` - only emits when
         * data really changed thus can be successfully used with `[data]` and two way `[(data)]` binding.
         *
         * See more: https://angular.io/guide/template-syntax#two-way-binding---
         */
        this.dataChange = new EventEmitter();
        /**
         * Fires when the editing view of the editor is focused. It corresponds with the `editor#focus`
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-focus
         * event.
         */
        this.focus = new EventEmitter();
        /**
         * Fires when the editing view of the editor is blurred. It corresponds with the `editor#blur`
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#event-blur
         * event.
         */
        this.blur = new EventEmitter();
        /**
         * If the component is read–only before the editor instance is created, it remembers that state,
         * so the editor can become read–only once it is ready.
         */
        this._readOnly = null;
        this._data = null;
        /**
         * CKEditor 4 script url address. Script will be loaded only if CKEDITOR namespace is missing.
         *
         * Defaults to 'https://cdn.ckeditor.com/4.14.0/standard-all/ckeditor.js'
         */
        this.editorUrl = 'https://cdn.ckeditor.com/4.14.0/standard-all/ckeditor.js';
    }
    CKEditorComponent_1 = CKEditorComponent;
    Object.defineProperty(CKEditorComponent.prototype, "data", {
        get: function () {
            return this._data;
        },
        /**
         * Keeps track of the editor's data.
         *
         * It's also decorated as an input which is useful when not using the ngModel.
         *
         * See https://angular.io/api/forms/NgModel to learn more.
         */
        set: function (data) {
            if (data === this._data) {
                return;
            }
            if (this.instance) {
                this.instance.setData(data);
                // Data may be changed by ACF.
                this._data = this.instance.getData();
                return;
            }
            this._data = data;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CKEditorComponent.prototype, "readOnly", {
        get: function () {
            if (this.instance) {
                return this.instance.readOnly;
            }
            return this._readOnly;
        },
        /**
         * When set `true`, the editor becomes read-only.
         * https://ckeditor.com/docs/ckeditor4/latest/api/CKEDITOR_editor.html#property-readOnly
         * to learn more.
         */
        set: function (isReadOnly) {
            if (this.instance) {
                this.instance.setReadOnly(isReadOnly);
                return;
            }
            // Delay setting read-only state until editor initialization.
            this._readOnly = isReadOnly;
        },
        enumerable: true,
        configurable: true
    });
    CKEditorComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        getEditorNamespace(this.editorUrl).then(function () {
            _this.ngZone.runOutsideAngular(_this.createEditor.bind(_this));
        }).catch(window.console.error);
    };
    CKEditorComponent.prototype.ngOnDestroy = function () {
        var _this = this;
        this.ngZone.runOutsideAngular(function () {
            if (_this.instance) {
                _this.instance.destroy();
                _this.instance = null;
            }
        });
    };
    CKEditorComponent.prototype.writeValue = function (value) {
        this.data = value;
    };
    CKEditorComponent.prototype.registerOnChange = function (callback) {
        this.onChange = callback;
    };
    CKEditorComponent.prototype.registerOnTouched = function (callback) {
        this.onTouched = callback;
    };
    CKEditorComponent.prototype.createEditor = function () {
        var _this = this;
        var element = document.createElement(this.tagName);
        this.elementRef.nativeElement.appendChild(element);
        if (this.type === "divarea" /* DIVAREA */) {
            this.config = this.ensureDivareaPlugin(this.config || {});
        }
        CKEDITOR.on('instanceCreated', function (evt) {
            _this.ngZone.run(function () {
                _this.created.emit(evt);
            });
        });
        var instance = this.type === "inline" /* INLINE */
            ? CKEDITOR.inline(element, this.config)
            : CKEDITOR.replace(element, this.config);
        instance.once('instanceReady', function (evt) {
            _this.instance = instance;
            // Read only state may change during instance initialization.
            _this.readOnly = _this._readOnly !== null ? _this._readOnly : _this.instance.readOnly;
            _this.subscribe(_this.instance);
            var undo = instance.undoManager;
            if (_this.data !== null) {
                undo && undo.lock();
                instance.setData(_this.data, { callback: function () {
                        // Locking undoManager prevents 'change' event.
                        // Trigger it manually to updated bound data.
                        if (_this.data !== instance.getData()) {
                            undo ? instance.fire('change') : instance.fire('dataReady');
                        }
                        undo && undo.unlock();
                        _this.ngZone.run(function () {
                            _this.ready.emit(evt);
                        });
                    } });
            }
            else {
                _this.ngZone.run(function () {
                    _this.ready.emit(evt);
                });
            }
        });
    };
    CKEditorComponent.prototype.subscribe = function (editor) {
        var _this = this;
        editor.on('focus', function (evt) {
            _this.ngZone.run(function () {
                _this.focus.emit(evt);
            });
        });
        editor.on('blur', function (evt) {
            _this.ngZone.run(function () {
                if (_this.onTouched) {
                    _this.onTouched();
                }
                _this.blur.emit(evt);
            });
        });
        editor.on('dataReady', this.propagateChange, this);
        if (this.instance.undoManager) {
            editor.on('change', this.propagateChange, this);
        }
        // If 'undo' plugin is not loaded, listen to 'selectionCheck' event instead. (#54).
        else {
            editor.on('selectionCheck', this.propagateChange, this);
        }
    };
    CKEditorComponent.prototype.propagateChange = function (event) {
        var _this = this;
        this.ngZone.run(function () {
            var newData = _this.instance.getData();
            if (event.name == 'change') {
                _this.change.emit(event);
            }
            else if (event.name == 'dataReady') {
                _this.dataReady.emit(event);
            }
            if (newData === _this.data) {
                return;
            }
            _this._data = newData;
            _this.dataChange.emit(newData);
            if (_this.onChange) {
                _this.onChange(newData);
            }
        });
    };
    CKEditorComponent.prototype.ensureDivareaPlugin = function (config) {
        var extraPlugins = config.extraPlugins, removePlugins = config.removePlugins;
        extraPlugins = this.removePlugin(extraPlugins, 'divarea') || '';
        extraPlugins = extraPlugins.concat(typeof extraPlugins === 'string' ? ',divarea' : 'divarea');
        if (removePlugins && removePlugins.includes('divarea')) {
            removePlugins = this.removePlugin(removePlugins, 'divarea');
            console.warn('[CKEDITOR] divarea plugin is required to initialize editor using Angular integration.');
        }
        return Object.assign({}, config, { extraPlugins: extraPlugins, removePlugins: removePlugins });
    };
    CKEditorComponent.prototype.removePlugin = function (plugins, toRemove) {
        if (!plugins) {
            return null;
        }
        var isString = typeof plugins === 'string';
        if (isString) {
            plugins = plugins.split(',');
        }
        plugins = plugins.filter(function (plugin) { return plugin !== toRemove; });
        if (isString) {
            plugins = plugins.join(',');
        }
        return plugins;
    };
    var CKEditorComponent_1;
    CKEditorComponent.ctorParameters = function () { return [
        { type: ElementRef },
        { type: NgZone }
    ]; };
    tslib_1.__decorate([
        Input()
    ], CKEditorComponent.prototype, "config", void 0);
    tslib_1.__decorate([
        Input()
    ], CKEditorComponent.prototype, "tagName", void 0);
    tslib_1.__decorate([
        Input()
    ], CKEditorComponent.prototype, "type", void 0);
    tslib_1.__decorate([
        Input()
    ], CKEditorComponent.prototype, "data", null);
    tslib_1.__decorate([
        Input()
    ], CKEditorComponent.prototype, "readOnly", null);
    tslib_1.__decorate([
        Output()
    ], CKEditorComponent.prototype, "ready", void 0);
    tslib_1.__decorate([
        Output()
    ], CKEditorComponent.prototype, "created", void 0);
    tslib_1.__decorate([
        Output()
    ], CKEditorComponent.prototype, "dataReady", void 0);
    tslib_1.__decorate([
        Output()
    ], CKEditorComponent.prototype, "change", void 0);
    tslib_1.__decorate([
        Output()
    ], CKEditorComponent.prototype, "dataChange", void 0);
    tslib_1.__decorate([
        Output()
    ], CKEditorComponent.prototype, "focus", void 0);
    tslib_1.__decorate([
        Output()
    ], CKEditorComponent.prototype, "blur", void 0);
    tslib_1.__decorate([
        Input()
    ], CKEditorComponent.prototype, "editorUrl", void 0);
    CKEditorComponent = CKEditorComponent_1 = tslib_1.__decorate([
        Component({
            selector: 'ckeditor',
            template: '<ng-template></ng-template>',
            providers: [
                {
                    provide: NG_VALUE_ACCESSOR,
                    useExisting: forwardRef(function () { return CKEditorComponent_1; }),
                    multi: true,
                }
            ]
        })
    ], CKEditorComponent);
    return CKEditorComponent;
}());
export { CKEditorComponent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2tlZGl0b3IuY29tcG9uZW50LmpzIiwic291cmNlUm9vdCI6Im5nOi8vY2tlZGl0b3I0LWFuZ3VsYXIvIiwic291cmNlcyI6WyJja2VkaXRvci5jb21wb25lbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7OztHQUdHOztBQUVILE9BQU8sRUFDTixTQUFTLEVBQ1QsTUFBTSxFQUNOLEtBQUssRUFDTCxNQUFNLEVBQ04sWUFBWSxFQUNaLFVBQVUsRUFDVixVQUFVLEVBQ1YsYUFBYSxFQUFFLFNBQVMsRUFDeEIsTUFBTSxlQUFlLENBQUM7QUFFdkIsT0FBTyxFQUVOLGlCQUFpQixFQUNqQixNQUFNLGdCQUFnQixDQUFDO0FBRXhCLE9BQU8sRUFBRSxrQkFBa0IsRUFBRSxNQUFNLG9CQUFvQixDQUFDO0FBa0J4RDtJQWtLQywyQkFBcUIsVUFBc0IsRUFBVSxNQUFjO1FBQTlDLGVBQVUsR0FBVixVQUFVLENBQVk7UUFBVSxXQUFNLEdBQU4sTUFBTSxDQUFRO1FBMUpuRTs7OztXQUlHO1FBQ00sWUFBTyxHQUFHLFVBQVUsQ0FBQztRQUU5Qjs7Ozs7Ozs7O1dBU0c7UUFDTSxTQUFJLDJCQUFzRDtRQW9EbkU7Ozs7V0FJRztRQUNPLFVBQUssR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQUdoRCxZQUFPLEdBQUcsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFNUQ7Ozs7O1dBS0c7UUFDTyxjQUFTLEdBQUcsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFOUQ7Ozs7OztXQU1HO1FBQ08sV0FBTSxHQUFHLElBQUksWUFBWSxFQUF1QixDQUFDO1FBRTNEOzs7OztXQUtHO1FBQ08sZUFBVSxHQUFHLElBQUksWUFBWSxFQUF1QixDQUFDO1FBRS9EOzs7O1dBSUc7UUFDTyxVQUFLLEdBQUcsSUFBSSxZQUFZLEVBQXVCLENBQUM7UUFFMUQ7Ozs7V0FJRztRQUNPLFNBQUksR0FBRyxJQUFJLFlBQVksRUFBdUIsQ0FBQztRQU96RDs7O1dBR0c7UUFDSyxjQUFTLEdBQVks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Qzs7O2dCQXZLZ0MsVUFBVTtnQkFBa0IsTUFBTTs7SUE1SjFEO1FBQVIsS0FBSyxFQUFFO3FEQUEyQjtJQU8xQjtRQUFSLEtBQUssRUFBRTtzREFBc0I7SUFZckI7UUFBUixLQUFLLEVBQUU7bURBQTJEO0lBUzFEO1FBQVIsS0FBSyxFQUFFO2lEQWNQO0lBV1E7UUFBUixLQUFLLEVBQUU7cURBUVA7SUFlUztRQUFULE1BQU0sRUFBRTtvREFBaUQ7SUFHaEQ7UUFBVCxNQUFNLEVBQUU7c0RBQW1EO0lBUWxEO1FBQVQsTUFBTSxFQUFFO3dEQUFxRDtJQVNwRDtRQUFULE1BQU0sRUFBRTtxREFBa0Q7SUFRakQ7UUFBVCxNQUFNLEVBQUU7eURBQXNEO0lBT3JEO1FBQVQsTUFBTSxFQUFFO29EQUFpRDtJQU9oRDtRQUFULE1BQU0sRUFBRTttREFBZ0Q7SUFvQ2hEO1FBQVIsS0FBSyxFQUFFO3dEQUF3RTtJQWhLcEUsaUJBQWlCO1FBWjdCLFNBQVMsQ0FBRTtZQUNYLFFBQVEsRUFBRSxVQUFVO1lBQ3BCLFFBQVEsRUFBRSw2QkFBNkI7WUFFdkMsU0FBUyxFQUFFO2dCQUNWO29CQUNDLE9BQU8sRUFBRSxpQkFBaUI7b0JBQzFCLFdBQVcsRUFBRSxVQUFVLENBQUUsY0FBTSxPQUFBLG1CQUFpQixFQUFqQixDQUFpQixDQUFFO29CQUNsRCxLQUFLLEVBQUUsSUFBSTtpQkFDWDthQUNEO1NBQ0QsQ0FBRTtPQUNVLGlCQUFpQixDQTBVN0I7SUFBRCx3QkFBQztDQUFBLEFBMVVELElBMFVDO1NBMVVZLGlCQUFpQiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQGxpY2Vuc2UgQ29weXJpZ2h0IChjKSAyMDAzLTIwMjAsIENLU291cmNlIC0gRnJlZGVyaWNvIEtuYWJiZW4uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBGb3IgbGljZW5zaW5nLCBzZWUgTElDRU5TRS5tZC5cbiAqL1xuXG5pbXBvcnQge1xuXHRDb21wb25lbnQsXG5cdE5nWm9uZSxcblx0SW5wdXQsXG5cdE91dHB1dCxcblx0RXZlbnRFbWl0dGVyLFxuXHRmb3J3YXJkUmVmLFxuXHRFbGVtZW50UmVmLFxuXHRBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3lcbn0gZnJvbSAnQGFuZ3VsYXIvY29yZSc7XG5cbmltcG9ydCB7XG5cdENvbnRyb2xWYWx1ZUFjY2Vzc29yLFxuXHROR19WQUxVRV9BQ0NFU1NPUlxufSBmcm9tICdAYW5ndWxhci9mb3Jtcyc7XG5cbmltcG9ydCB7IGdldEVkaXRvck5hbWVzcGFjZSB9IGZyb20gJy4vY2tlZGl0b3IuaGVscGVycyc7XG5cbmltcG9ydCB7IENLRWRpdG9yNCB9IGZyb20gJy4vY2tlZGl0b3InO1xuXG5kZWNsYXJlIGxldCBDS0VESVRPUjogYW55O1xuXG5AQ29tcG9uZW50KCB7XG5cdHNlbGVjdG9yOiAnY2tlZGl0b3InLFxuXHR0ZW1wbGF0ZTogJzxuZy10ZW1wbGF0ZT48L25nLXRlbXBsYXRlPicsXG5cblx0cHJvdmlkZXJzOiBbXG5cdFx0e1xuXHRcdFx0cHJvdmlkZTogTkdfVkFMVUVfQUNDRVNTT1IsXG5cdFx0XHR1c2VFeGlzdGluZzogZm9yd2FyZFJlZiggKCkgPT4gQ0tFZGl0b3JDb21wb25lbnQgKSxcblx0XHRcdG11bHRpOiB0cnVlLFxuXHRcdH1cblx0XVxufSApXG5leHBvcnQgY2xhc3MgQ0tFZGl0b3JDb21wb25lbnQgaW1wbGVtZW50cyBBZnRlclZpZXdJbml0LCBPbkRlc3Ryb3ksIENvbnRyb2xWYWx1ZUFjY2Vzc29yIHtcblx0LyoqXG5cdCAqIFRoZSBjb25maWd1cmF0aW9uIG9mIHRoZSBlZGl0b3IuXG5cdCAqIFNlZSBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvYXBpL0NLRURJVE9SX2NvbmZpZy5odG1sXG5cdCAqIHRvIGxlYXJuIG1vcmUuXG5cdCAqL1xuXHRASW5wdXQoKSBjb25maWc/OiBDS0VkaXRvcjQuQ29uZmlnO1xuXG5cdC8qKlxuXHQgKiBUYWcgbmFtZSBvZiB0aGUgZWRpdG9yIGNvbXBvbmVudC5cblx0ICpcblx0ICogVGhlIGRlZmF1bHQgdGFnIGlzIGB0ZXh0YXJlYWAuXG5cdCAqL1xuXHRASW5wdXQoKSB0YWdOYW1lID0gJ3RleHRhcmVhJztcblxuXHQvKipcblx0ICogVGhlIHR5cGUgb2YgdGhlIGVkaXRvciBpbnRlcmZhY2UuXG5cdCAqXG5cdCAqIEJ5IGRlZmF1bHQgZWRpdG9yIGludGVyZmFjZSB3aWxsIGJlIGluaXRpYWxpemVkIGFzIGBkaXZhcmVhYCBlZGl0b3Igd2hpY2ggaXMgYW4gaW5saW5lIGVkaXRvciB3aXRoIGZpeGVkIFVJLlxuXHQgKiBZb3UgY2FuIGNoYW5nZSBpbnRlcmZhY2UgdHlwZSBieSBjaG9vc2luZyBiZXR3ZWVuIGBkaXZhcmVhYCBhbmQgYGlubGluZWAgZWRpdG9yIGludGVyZmFjZSB0eXBlcy5cblx0ICpcblx0ICogU2VlIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9ndWlkZS9kZXZfdWl0eXBlcy5odG1sXG5cdCAqIGFuZCBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvZXhhbXBsZXMvZml4ZWR1aS5odG1sXG5cdCAqIHRvIGxlYXJuIG1vcmUuXG5cdCAqL1xuXHRASW5wdXQoKSB0eXBlOiBDS0VkaXRvcjQuRWRpdG9yVHlwZSA9IENLRWRpdG9yNC5FZGl0b3JUeXBlLkNMQVNTSUM7XG5cblx0LyoqXG5cdCAqIEtlZXBzIHRyYWNrIG9mIHRoZSBlZGl0b3IncyBkYXRhLlxuXHQgKlxuXHQgKiBJdCdzIGFsc28gZGVjb3JhdGVkIGFzIGFuIGlucHV0IHdoaWNoIGlzIHVzZWZ1bCB3aGVuIG5vdCB1c2luZyB0aGUgbmdNb2RlbC5cblx0ICpcblx0ICogU2VlIGh0dHBzOi8vYW5ndWxhci5pby9hcGkvZm9ybXMvTmdNb2RlbCB0byBsZWFybiBtb3JlLlxuXHQgKi9cblx0QElucHV0KCkgc2V0IGRhdGEoIGRhdGE6IHN0cmluZyApIHtcblx0XHRpZiAoIGRhdGEgPT09IHRoaXMuX2RhdGEgKSB7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0aWYgKCB0aGlzLmluc3RhbmNlICkge1xuXHRcdFx0dGhpcy5pbnN0YW5jZS5zZXREYXRhKCBkYXRhICk7XG5cdFx0XHQvLyBEYXRhIG1heSBiZSBjaGFuZ2VkIGJ5IEFDRi5cblx0XHRcdHRoaXMuX2RhdGEgPSB0aGlzLmluc3RhbmNlLmdldERhdGEoKTtcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHR0aGlzLl9kYXRhID0gZGF0YTtcblxuXHR9XG5cblx0Z2V0IGRhdGEoKTogc3RyaW5nIHtcblx0XHRyZXR1cm4gdGhpcy5fZGF0YTtcblx0fVxuXG5cdC8qKlxuXHQgKiBXaGVuIHNldCBgdHJ1ZWAsIHRoZSBlZGl0b3IgYmVjb21lcyByZWFkLW9ubHkuXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjcHJvcGVydHktcmVhZE9ubHlcblx0ICogdG8gbGVhcm4gbW9yZS5cblx0ICovXG5cdEBJbnB1dCgpIHNldCByZWFkT25seSggaXNSZWFkT25seTogYm9vbGVhbiApIHtcblx0XHRpZiAoIHRoaXMuaW5zdGFuY2UgKSB7XG5cdFx0XHR0aGlzLmluc3RhbmNlLnNldFJlYWRPbmx5KCBpc1JlYWRPbmx5ICk7XG5cdFx0XHRyZXR1cm47XG5cdFx0fVxuXG5cdFx0Ly8gRGVsYXkgc2V0dGluZyByZWFkLW9ubHkgc3RhdGUgdW50aWwgZWRpdG9yIGluaXRpYWxpemF0aW9uLlxuXHRcdHRoaXMuX3JlYWRPbmx5ID0gaXNSZWFkT25seTtcblx0fVxuXG5cdGdldCByZWFkT25seSgpOiBib29sZWFuIHtcblx0XHRpZiAoIHRoaXMuaW5zdGFuY2UgKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5pbnN0YW5jZS5yZWFkT25seTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdGhpcy5fcmVhZE9ubHk7XG5cdH1cblxuXHQvKipcblx0ICogRmlyZXMgd2hlbiB0aGUgZWRpdG9yIGlzIHJlYWR5LiBJdCBjb3JyZXNwb25kcyB3aXRoIHRoZSBgZWRpdG9yI2luc3RhbmNlUmVhZHlgXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjZXZlbnQtaW5zdGFuY2VSZWFkeVxuXHQgKiBldmVudC5cblx0ICovXG5cdEBPdXRwdXQoKSByZWFkeSA9IG5ldyBFdmVudEVtaXR0ZXI8Q0tFZGl0b3I0LkV2ZW50SW5mbz4oKTtcblxuXHRcblx0QE91dHB1dCgpIGNyZWF0ZWQgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0LyoqXG5cdCAqIEZpcmVzIHdoZW4gdGhlIGVkaXRvciBkYXRhIGlzIGxvYWRlZCwgZS5nLiBhZnRlciBjYWxsaW5nIHNldERhdGEoKVxuXHQgKiBodHRwczovL2NrZWRpdG9yLmNvbS9kb2NzL2NrZWRpdG9yNC9sYXRlc3QvYXBpL0NLRURJVE9SX2VkaXRvci5odG1sI21ldGhvZC1zZXREYXRhXG5cdCAqIGVkaXRvcidzIG1ldGhvZC4gSXQgY29ycmVzcG9uZHMgd2l0aCB0aGUgYGVkaXRvciNkYXRhUmVhZHlgXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjZXZlbnQtZGF0YVJlYWR5IGV2ZW50LlxuXHQgKi9cblx0QE91dHB1dCgpIGRhdGFSZWFkeSA9IG5ldyBFdmVudEVtaXR0ZXI8Q0tFZGl0b3I0LkV2ZW50SW5mbz4oKTtcblxuXHQvKipcblx0ICogRmlyZXMgd2hlbiB0aGUgY29udGVudCBvZiB0aGUgZWRpdG9yIGhhcyBjaGFuZ2VkLiBJdCBjb3JyZXNwb25kcyB3aXRoIHRoZSBgZWRpdG9yI2NoYW5nZWBcblx0ICogaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2FwaS9DS0VESVRPUl9lZGl0b3IuaHRtbCNldmVudC1jaGFuZ2Vcblx0ICogZXZlbnQuIEZvciBwZXJmb3JtYW5jZSByZWFzb25zIHRoaXMgZXZlbnQgbWF5IGJlIGNhbGxlZCBldmVuIHdoZW4gZGF0YSBkaWRuJ3QgcmVhbGx5IGNoYW5nZWQuXG5cdCAqIFBsZWFzZSBub3RlIHRoYXQgdGhpcyBldmVudCB3aWxsIG9ubHkgYmUgZmlyZWQgd2hlbiBgdW5kb2AgcGx1Z2luIGlzIGxvYWRlZC4gSWYgeW91IG5lZWQgdG9cblx0ICogbGlzdGVuIGZvciBlZGl0b3IgY2hhbmdlcyAoZS5nLiBmb3IgdHdvLXdheSBkYXRhIGJpbmRpbmcpLCB1c2UgYGRhdGFDaGFuZ2VgIGV2ZW50IGluc3RlYWQuXG5cdCAqL1xuXHRAT3V0cHV0KCkgY2hhbmdlID0gbmV3IEV2ZW50RW1pdHRlcjxDS0VkaXRvcjQuRXZlbnRJbmZvPigpO1xuXG5cdC8qKlxuXHQgKiBGaXJlcyB3aGVuIHRoZSBjb250ZW50IG9mIHRoZSBlZGl0b3IgaGFzIGNoYW5nZWQuIEluIGNvbnRyYXN0IHRvIGBjaGFuZ2VgIC0gb25seSBlbWl0cyB3aGVuXG5cdCAqIGRhdGEgcmVhbGx5IGNoYW5nZWQgdGh1cyBjYW4gYmUgc3VjY2Vzc2Z1bGx5IHVzZWQgd2l0aCBgW2RhdGFdYCBhbmQgdHdvIHdheSBgWyhkYXRhKV1gIGJpbmRpbmcuXG5cdCAqXG5cdCAqIFNlZSBtb3JlOiBodHRwczovL2FuZ3VsYXIuaW8vZ3VpZGUvdGVtcGxhdGUtc3ludGF4I3R3by13YXktYmluZGluZy0tLVxuXHQgKi9cblx0QE91dHB1dCgpIGRhdGFDaGFuZ2UgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0LyoqXG5cdCAqIEZpcmVzIHdoZW4gdGhlIGVkaXRpbmcgdmlldyBvZiB0aGUgZWRpdG9yIGlzIGZvY3VzZWQuIEl0IGNvcnJlc3BvbmRzIHdpdGggdGhlIGBlZGl0b3IjZm9jdXNgXG5cdCAqIGh0dHBzOi8vY2tlZGl0b3IuY29tL2RvY3MvY2tlZGl0b3I0L2xhdGVzdC9hcGkvQ0tFRElUT1JfZWRpdG9yLmh0bWwjZXZlbnQtZm9jdXNcblx0ICogZXZlbnQuXG5cdCAqL1xuXHRAT3V0cHV0KCkgZm9jdXMgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0LyoqXG5cdCAqIEZpcmVzIHdoZW4gdGhlIGVkaXRpbmcgdmlldyBvZiB0aGUgZWRpdG9yIGlzIGJsdXJyZWQuIEl0IGNvcnJlc3BvbmRzIHdpdGggdGhlIGBlZGl0b3IjYmx1cmBcblx0ICogaHR0cHM6Ly9ja2VkaXRvci5jb20vZG9jcy9ja2VkaXRvcjQvbGF0ZXN0L2FwaS9DS0VESVRPUl9lZGl0b3IuaHRtbCNldmVudC1ibHVyXG5cdCAqIGV2ZW50LlxuXHQgKi9cblx0QE91dHB1dCgpIGJsdXIgPSBuZXcgRXZlbnRFbWl0dGVyPENLRWRpdG9yNC5FdmVudEluZm8+KCk7XG5cblx0LyoqXG5cdCAqIFRoZSBpbnN0YW5jZSBvZiB0aGUgZWRpdG9yIGNyZWF0ZWQgYnkgdGhpcyBjb21wb25lbnQuXG5cdCAqL1xuXHRpbnN0YW5jZTogYW55O1xuXG5cdC8qKlxuXHQgKiBJZiB0aGUgY29tcG9uZW50IGlzIHJlYWTigJNvbmx5IGJlZm9yZSB0aGUgZWRpdG9yIGluc3RhbmNlIGlzIGNyZWF0ZWQsIGl0IHJlbWVtYmVycyB0aGF0IHN0YXRlLFxuXHQgKiBzbyB0aGUgZWRpdG9yIGNhbiBiZWNvbWUgcmVhZOKAk29ubHkgb25jZSBpdCBpcyByZWFkeS5cblx0ICovXG5cdHByaXZhdGUgX3JlYWRPbmx5OiBib29sZWFuID0gbnVsbDtcblxuXHQvKipcblx0ICogQSBjYWxsYmFjayBleGVjdXRlZCB3aGVuIHRoZSBjb250ZW50IG9mIHRoZSBlZGl0b3IgY2hhbmdlcy4gUGFydCBvZiB0aGVcblx0ICogYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCAoaHR0cHM6Ly9hbmd1bGFyLmlvL2FwaS9mb3Jtcy9Db250cm9sVmFsdWVBY2Nlc3NvcikgaW50ZXJmYWNlLlxuXHQgKlxuXHQgKiBOb3RlOiBVbnNldCB1bmxlc3MgdGhlIGNvbXBvbmVudCB1c2VzIHRoZSBgbmdNb2RlbGAuXG5cdCAqL1xuXHRvbkNoYW5nZT86ICggZGF0YTogc3RyaW5nICkgPT4gdm9pZDtcblxuXHQvKipcblx0ICogQSBjYWxsYmFjayBleGVjdXRlZCB3aGVuIHRoZSBlZGl0b3IgaGFzIGJlZW4gYmx1cnJlZC4gUGFydCBvZiB0aGVcblx0ICogYENvbnRyb2xWYWx1ZUFjY2Vzc29yYCAoaHR0cHM6Ly9hbmd1bGFyLmlvL2FwaS9mb3Jtcy9Db250cm9sVmFsdWVBY2Nlc3NvcikgaW50ZXJmYWNlLlxuXHQgKlxuXHQgKiBOb3RlOiBVbnNldCB1bmxlc3MgdGhlIGNvbXBvbmVudCB1c2VzIHRoZSBgbmdNb2RlbGAuXG5cdCAqL1xuXHRvblRvdWNoZWQ/OiAoKSA9PiB2b2lkO1xuXG5cdHByaXZhdGUgX2RhdGE6IHN0cmluZyA9IG51bGw7XG5cblx0LyoqXG5cdCAqIENLRWRpdG9yIDQgc2NyaXB0IHVybCBhZGRyZXNzLiBTY3JpcHQgd2lsbCBiZSBsb2FkZWQgb25seSBpZiBDS0VESVRPUiBuYW1lc3BhY2UgaXMgbWlzc2luZy5cblx0ICpcblx0ICogRGVmYXVsdHMgdG8gJ2h0dHBzOi8vY2RuLmNrZWRpdG9yLmNvbS80LjE0LjAvc3RhbmRhcmQtYWxsL2NrZWRpdG9yLmpzJ1xuXHQgKi9cblx0QElucHV0KCkgZWRpdG9yVXJsID0gJ2h0dHBzOi8vY2RuLmNrZWRpdG9yLmNvbS80LjE0LjAvc3RhbmRhcmQtYWxsL2NrZWRpdG9yLmpzJztcblxuXHRjb25zdHJ1Y3RvciggcHJpdmF0ZSBlbGVtZW50UmVmOiBFbGVtZW50UmVmLCBwcml2YXRlIG5nWm9uZTogTmdab25lICkge1xuXHR9XG5cblx0bmdBZnRlclZpZXdJbml0KCk6IHZvaWQge1xuXHRcdGdldEVkaXRvck5hbWVzcGFjZSggdGhpcy5lZGl0b3JVcmwgKS50aGVuKCAoKSA9PiB7XG5cdFx0XHR0aGlzLm5nWm9uZS5ydW5PdXRzaWRlQW5ndWxhciggdGhpcy5jcmVhdGVFZGl0b3IuYmluZCggdGhpcyApICk7XG5cdFx0fSApLmNhdGNoKCB3aW5kb3cuY29uc29sZS5lcnJvciApO1xuXHR9XG5cblx0bmdPbkRlc3Ryb3koKTogdm9pZCB7XG5cdFx0dGhpcy5uZ1pvbmUucnVuT3V0c2lkZUFuZ3VsYXIoICgpID0+IHtcblx0XHRcdGlmICggdGhpcy5pbnN0YW5jZSApIHtcblx0XHRcdFx0dGhpcy5pbnN0YW5jZS5kZXN0cm95KCk7XG5cdFx0XHRcdHRoaXMuaW5zdGFuY2UgPSBudWxsO1xuXHRcdFx0fVxuXHRcdH0gKTtcblx0fVxuXG5cdHdyaXRlVmFsdWUoIHZhbHVlOiBzdHJpbmcgKTogdm9pZCB7XG5cdFx0dGhpcy5kYXRhID0gdmFsdWU7XG5cdH1cblxuXHRyZWdpc3Rlck9uQ2hhbmdlKCBjYWxsYmFjazogKCBkYXRhOiBzdHJpbmcgKSA9PiB2b2lkICk6IHZvaWQge1xuXHRcdHRoaXMub25DaGFuZ2UgPSBjYWxsYmFjaztcblx0fVxuXG5cdHJlZ2lzdGVyT25Ub3VjaGVkKCBjYWxsYmFjazogKCkgPT4gdm9pZCApOiB2b2lkIHtcblx0XHR0aGlzLm9uVG91Y2hlZCA9IGNhbGxiYWNrO1xuXHR9XG5cblx0cHJpdmF0ZSBjcmVhdGVFZGl0b3IoKTogdm9pZCB7XG5cdFx0Y29uc3QgZWxlbWVudCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoIHRoaXMudGFnTmFtZSApO1xuXHRcdHRoaXMuZWxlbWVudFJlZi5uYXRpdmVFbGVtZW50LmFwcGVuZENoaWxkKCBlbGVtZW50ICk7XG5cblx0XHRpZiAoIHRoaXMudHlwZSA9PT0gQ0tFZGl0b3I0LkVkaXRvclR5cGUuRElWQVJFQSApIHtcblx0XHRcdHRoaXMuY29uZmlnID0gdGhpcy5lbnN1cmVEaXZhcmVhUGx1Z2luKCB0aGlzLmNvbmZpZyB8fCB7fSApO1xuXHRcdH1cblxuXHRcdENLRURJVE9SLm9uKCdpbnN0YW5jZUNyZWF0ZWQnLCBldnQgPT4ge1xuXHRcdFx0dGhpcy5uZ1pvbmUucnVuKCAoKSA9PiB7XG5cdFx0XHRcdHRoaXMuY3JlYXRlZC5lbWl0KCBldnQgKTtcblx0XHRcdH0gKTtcblx0XHR9KTtcblxuXHRcdGNvbnN0IGluc3RhbmNlOiBDS0VkaXRvcjQuRWRpdG9yID0gdGhpcy50eXBlID09PSBDS0VkaXRvcjQuRWRpdG9yVHlwZS5JTkxJTkVcblx0XHRcdD8gQ0tFRElUT1IuaW5saW5lKCBlbGVtZW50LCB0aGlzLmNvbmZpZyApXG5cdFx0XHQ6IENLRURJVE9SLnJlcGxhY2UoIGVsZW1lbnQsIHRoaXMuY29uZmlnICk7XG5cblxuXHRcdGluc3RhbmNlLm9uY2UoICdpbnN0YW5jZVJlYWR5JywgZXZ0ID0+IHtcblx0XHRcdHRoaXMuaW5zdGFuY2UgPSBpbnN0YW5jZTtcblxuXHRcdFx0Ly8gUmVhZCBvbmx5IHN0YXRlIG1heSBjaGFuZ2UgZHVyaW5nIGluc3RhbmNlIGluaXRpYWxpemF0aW9uLlxuXHRcdFx0dGhpcy5yZWFkT25seSA9IHRoaXMuX3JlYWRPbmx5ICE9PSBudWxsID8gdGhpcy5fcmVhZE9ubHkgOiB0aGlzLmluc3RhbmNlLnJlYWRPbmx5O1xuXG5cdFx0XHR0aGlzLnN1YnNjcmliZSggdGhpcy5pbnN0YW5jZSApO1xuXG5cdFx0XHRjb25zdCB1bmRvID0gaW5zdGFuY2UudW5kb01hbmFnZXI7XG5cblx0XHRcdGlmICggdGhpcy5kYXRhICE9PSBudWxsICkge1xuXHRcdFx0XHR1bmRvICYmIHVuZG8ubG9jaygpO1xuXG5cdFx0XHRcdGluc3RhbmNlLnNldERhdGEoIHRoaXMuZGF0YSwgeyBjYWxsYmFjazogKCkgPT4ge1xuXHRcdFx0XHRcdC8vIExvY2tpbmcgdW5kb01hbmFnZXIgcHJldmVudHMgJ2NoYW5nZScgZXZlbnQuXG5cdFx0XHRcdFx0Ly8gVHJpZ2dlciBpdCBtYW51YWxseSB0byB1cGRhdGVkIGJvdW5kIGRhdGEuXG5cdFx0XHRcdFx0aWYgKCB0aGlzLmRhdGEgIT09IGluc3RhbmNlLmdldERhdGEoKSApIHtcblx0XHRcdFx0XHRcdHVuZG8gPyBpbnN0YW5jZS5maXJlKCAnY2hhbmdlJyApIDogaW5zdGFuY2UuZmlyZSggJ2RhdGFSZWFkeScgKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0dW5kbyAmJiB1bmRvLnVubG9jaygpO1xuXG5cdFx0XHRcdFx0dGhpcy5uZ1pvbmUucnVuKCAoKSA9PiB7XG5cdFx0XHRcdFx0XHR0aGlzLnJlYWR5LmVtaXQoIGV2dCApO1xuXHRcdFx0XHRcdH0gKTtcblx0XHRcdFx0fSB9ICk7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0aGlzLm5nWm9uZS5ydW4oICgpID0+IHtcblx0XHRcdFx0XHR0aGlzLnJlYWR5LmVtaXQoIGV2dCApO1xuXHRcdFx0XHR9ICk7XG5cdFx0XHR9XG5cdFx0fSApO1xuXHR9XG5cblx0cHJpdmF0ZSBzdWJzY3JpYmUoIGVkaXRvcjogYW55ICk6IHZvaWQge1xuXHRcdGVkaXRvci5vbiggJ2ZvY3VzJywgZXZ0ID0+IHtcblx0XHRcdHRoaXMubmdab25lLnJ1biggKCkgPT4ge1xuXHRcdFx0XHR0aGlzLmZvY3VzLmVtaXQoIGV2dCApO1xuXHRcdFx0fSApO1xuXHRcdH0gKTtcblxuXHRcdGVkaXRvci5vbiggJ2JsdXInLCBldnQgPT4ge1xuXHRcdFx0dGhpcy5uZ1pvbmUucnVuKCAoKSA9PiB7XG5cdFx0XHRcdGlmICggdGhpcy5vblRvdWNoZWQgKSB7XG5cdFx0XHRcdFx0dGhpcy5vblRvdWNoZWQoKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdHRoaXMuYmx1ci5lbWl0KCBldnQgKTtcblx0XHRcdH0gKTtcblx0XHR9ICk7XG5cblx0XHRlZGl0b3Iub24oICdkYXRhUmVhZHknLCB0aGlzLnByb3BhZ2F0ZUNoYW5nZSwgdGhpcyApO1xuXG5cdFx0aWYgKCB0aGlzLmluc3RhbmNlLnVuZG9NYW5hZ2VyICkge1xuXHRcdFx0ZWRpdG9yLm9uKCAnY2hhbmdlJywgdGhpcy5wcm9wYWdhdGVDaGFuZ2UsIHRoaXMgKTtcblx0XHR9XG5cdFx0Ly8gSWYgJ3VuZG8nIHBsdWdpbiBpcyBub3QgbG9hZGVkLCBsaXN0ZW4gdG8gJ3NlbGVjdGlvbkNoZWNrJyBldmVudCBpbnN0ZWFkLiAoIzU0KS5cblx0XHRlbHNlIHtcblx0XHRcdGVkaXRvci5vbiggJ3NlbGVjdGlvbkNoZWNrJywgdGhpcy5wcm9wYWdhdGVDaGFuZ2UsIHRoaXMgKTtcblx0XHR9XG5cdH1cblxuXHRwcml2YXRlIHByb3BhZ2F0ZUNoYW5nZSggZXZlbnQ6IGFueSApOiB2b2lkIHtcblx0XHR0aGlzLm5nWm9uZS5ydW4oICgpID0+IHtcblx0XHRcdGNvbnN0IG5ld0RhdGEgPSB0aGlzLmluc3RhbmNlLmdldERhdGEoKTtcblxuXHRcdFx0aWYgKCBldmVudC5uYW1lID09ICdjaGFuZ2UnICkge1xuXHRcdFx0XHR0aGlzLmNoYW5nZS5lbWl0KCBldmVudCApO1xuXHRcdFx0fSBlbHNlIGlmICggZXZlbnQubmFtZSA9PSAnZGF0YVJlYWR5JyApIHtcblx0XHRcdFx0dGhpcy5kYXRhUmVhZHkuZW1pdCggZXZlbnQgKTtcblx0XHRcdH1cblxuXHRcdFx0aWYgKCBuZXdEYXRhID09PSB0aGlzLmRhdGEgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblxuXHRcdFx0dGhpcy5fZGF0YSA9IG5ld0RhdGE7XG5cdFx0XHR0aGlzLmRhdGFDaGFuZ2UuZW1pdCggbmV3RGF0YSApO1xuXG5cdFx0XHRpZiAoIHRoaXMub25DaGFuZ2UgKSB7XG5cdFx0XHRcdHRoaXMub25DaGFuZ2UoIG5ld0RhdGEgKTtcblx0XHRcdH1cblx0XHR9ICk7XG5cdH1cblxuXHRwcml2YXRlIGVuc3VyZURpdmFyZWFQbHVnaW4oIGNvbmZpZzogQ0tFZGl0b3I0LkNvbmZpZyApOiBDS0VkaXRvcjQuQ29uZmlnIHtcblx0XHRsZXQgeyBleHRyYVBsdWdpbnMsIHJlbW92ZVBsdWdpbnMgfSA9IGNvbmZpZztcblxuXHRcdGV4dHJhUGx1Z2lucyA9IHRoaXMucmVtb3ZlUGx1Z2luKCBleHRyYVBsdWdpbnMsICdkaXZhcmVhJyApIHx8ICcnO1xuXHRcdGV4dHJhUGx1Z2lucyA9IGV4dHJhUGx1Z2lucy5jb25jYXQoIHR5cGVvZiBleHRyYVBsdWdpbnMgPT09ICdzdHJpbmcnID8gJyxkaXZhcmVhJyA6ICdkaXZhcmVhJyApO1xuXG5cdFx0aWYgKCByZW1vdmVQbHVnaW5zICYmIHJlbW92ZVBsdWdpbnMuaW5jbHVkZXMoICdkaXZhcmVhJyApICkge1xuXG5cdFx0XHRyZW1vdmVQbHVnaW5zID0gdGhpcy5yZW1vdmVQbHVnaW4oIHJlbW92ZVBsdWdpbnMsICdkaXZhcmVhJyApO1xuXG5cdFx0XHRjb25zb2xlLndhcm4oICdbQ0tFRElUT1JdIGRpdmFyZWEgcGx1Z2luIGlzIHJlcXVpcmVkIHRvIGluaXRpYWxpemUgZWRpdG9yIHVzaW5nIEFuZ3VsYXIgaW50ZWdyYXRpb24uJyApO1xuXHRcdH1cblxuXHRcdHJldHVybiBPYmplY3QuYXNzaWduKCB7fSwgY29uZmlnLCB7IGV4dHJhUGx1Z2lucywgcmVtb3ZlUGx1Z2lucyB9ICk7XG5cdH1cblxuXHRwcml2YXRlIHJlbW92ZVBsdWdpbiggcGx1Z2luczogc3RyaW5nIHwgc3RyaW5nW10sIHRvUmVtb3ZlOiBzdHJpbmcgKTogc3RyaW5nIHwgc3RyaW5nW10ge1xuXHRcdGlmICggIXBsdWdpbnMgKSB7XG5cdFx0XHRyZXR1cm4gbnVsbDtcblx0XHR9XG5cblx0XHRjb25zdCBpc1N0cmluZyA9IHR5cGVvZiBwbHVnaW5zID09PSAnc3RyaW5nJztcblxuXHRcdGlmICggaXNTdHJpbmcgKSB7XG5cdFx0XHRwbHVnaW5zID0gKCBwbHVnaW5zIGFzIHN0cmluZyApLnNwbGl0KCAnLCcgKTtcblx0XHR9XG5cblx0XHRwbHVnaW5zID0gKCBwbHVnaW5zIGFzIHN0cmluZ1tdICkuZmlsdGVyKCBwbHVnaW4gPT4gcGx1Z2luICE9PSB0b1JlbW92ZSApO1xuXG5cdFx0aWYgKCBpc1N0cmluZyApIHtcblx0XHRcdHBsdWdpbnMgPSAoIHBsdWdpbnMgYXMgc3RyaW5nW10gKS5qb2luKCAnLCcgKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gcGx1Z2lucztcblx0fVxufVxuIl19
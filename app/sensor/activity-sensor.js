import { today } from 'user-activity';

class ActivitySensor {
    constructor (options) {
        /**
         * @type {number}
         * @private
         */
        this._frequency = options.frequency || 1;

        /**
         * @type {function()}
         * @private
         */
        this._onreading = null;

        /**
         * @type {boolean}
         * @private
         */
        this._isActivated = false;

        /**
         * @type {number}
         * @private
         */
        this._latestActiveMinutes = 0;

        /**
         * @type {number}
         * @private
         */
        this._netActiveMinutes = 0;

        /**
         * @type {number}
         * @private
         */
        this._latestDistance = 0;

        /**
         * @type {number}
         * @private
         */
        this._netDistance = 0;

        /**
         * @type {number}
         * @private
         */
        this._latestCalories = 0;

        /**
         * @type {number}
         * @private
         */
        this._netCalories = 0;

        /**
         * @type {number}
         * @private
         */
        this._latestElevationGain = 0;

        /**
         * @type {number}
         * @private
         */
        this._netElevationGain = 0;

        /**
         * @type {number}
         * @private
         */
        this._latestSteps = 0;

        /**
         * @type {number}
         * @private
         */
        this._netSteps = 0;


        this._onReadingActivity = this._onReadingActivity.bind(this);
    }


    /**
     * @param {function()} onreading
     */
    set onreading (onreading) {
        this._onreading = onreading;
    }

    get activeMinutes () {
        return this._latestActiveMinutes;
    }

    get calories () {
        return this._latestCalories;
    }

    get distance () {
        return this._latestDistance;
    }

    get elevationGain () {
        return this._latestElevationGain;
    }

    get steps () {
        return this._latestSteps;
    }
    
    get netActiveMinutes () {
        return this._netActiveMinutes;
    }
    
    get netCalories () {
        return this._netCalories;
    }
    
    get netDistance () {
        return this._netDistance;
    }
    
    get netElevationGain () {
        return this._netElevationGain;
    }
    
    get netSteps () {
        return this._netSteps;
    }

    /**
     * @private
     */
    _onReadingActivity() {
        const activeMinutes = today.adjusted.activeMinutes;
        const elevationGain = today.adjusted.elevationGain;
        const calories = today.adjusted.calories;
        const distance = today.adjusted.distance;
        const steps = today.adjusted.steps;

        this._netActiveMinutes = this._latestActiveMinutes ? activeMinutes - this._latestActiveMinutes : this._netActiveMinutes;
        this._netElevationGain = this._latestElevationGain ? elevationGain - this._latestElevationGain : this._netElevationGain;
        this._netCalories = this._latestCalories ? calories - this._latestCalories : this._netCalories;
        this._netDistance = this._latestDistance? distance - this._latestDistance : this._netDistance;
        this._netActiveMinutes = this._latestSteps ? steps - this._latestSteps : this._netSteps;

        this._latestActiveMinutes = activeMinutes;
        this._latestElevationGain = elevationGain;
        this._latestCalories = calories;
        this._latestDistance = distance;
        this._latestSteps = steps;

        if (this._onreading && typeof this._onreading === 'function') {
            this._onreading();
        }
    }

    start () {
        if(this._isActivated) {
            return;
        }
        this._isActivated = true;
        setInterval(this._onReadingActivity, 1000 / this._frequency);
    }

    stop () {
        if (!this._isActivated) {
            return;
        }
        this._isActivated = false;
        clearInterval(this._onReadingActivity);
    }
}

export {
    ActivitySensor
}
<?php

namespace Application\Controller;

/**
 * Controller is the base controller class. Can be used to initialise
 * common functions amongst other classes (for example, template engine
 * initialisation). Uses a function called init which is called on construct.
 */
class Controller extends \Core\Controller {
	
    protected function init() {
		return true;
	}
}